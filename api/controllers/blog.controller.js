import prisma from '../lib/prisma.js';

// Helper function to generate slug
const generateSlug = (title) => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim('-');
};

// Helper function to calculate reading time
const calculateReadingTime = (content) => {
  const wordsPerMinute = 200;
  const words = content.split(/\s+/).length;
  return Math.ceil(words / wordsPerMinute);
};

// Get all published blogs with pagination and filters
export const getAllBlogs = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      category,
      tag,
      search,
      featured,
      sortBy = 'publishedAt',
      order = 'desc',
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {
      isPublished: true,
      ...(category && { category: { slug: category } }),
      ...(tag && { tags: { has: tag } }),
      ...(featured && { isFeatured: featured === 'true' }),
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { excerpt: { contains: search, mode: 'insensitive' } },
          { content: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const [blogs, total] = await Promise.all([
      prisma.blog.findMany({
        where,
        include: {
          author: {
            select: {
              id: true,
              username: true,
              firstName: true,
              lastName: true,
              profilePhoto: true,
            },
          },
          category: true,
          _count: {
            select: { comments: true },
          },
        },
        orderBy: { [sortBy]: order },
        skip,
        take: parseInt(limit),
      }),
      prisma.blog.count({ where }),
    ]);

    res.status(200).json({
      blogs,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        total,
        hasNext: skip + parseInt(limit) < total,
        hasPrev: parseInt(page) > 1,
      },
    });
  } catch (error) {
    console.error('Get blogs error:', error);
    res.status(500).json({ message: 'Failed to fetch blogs!' });
  }
};

// Get single blog by slug
export const getBlogBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const blog = await prisma.blog.findUnique({
      where: { slug, isPublished: true },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            profilePhoto: true,
            aboutCompany: true,
          },
        },
        category: true,
        comments: {
          where: { isApproved: true },
          include: {
            author: {
              select: {
                id: true,
                username: true,
                firstName: true,
                lastName: true,
                profilePhoto: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!blog) {
      return res.status(404).json({ message: 'Blog not found!' });
    }

    // Increment view count
    await prisma.blog.update({
      where: { id: blog.id },
      data: { viewCount: { increment: 1 } },
    });

    // Get related blogs
    const relatedBlogs = await prisma.blog.findMany({
      where: {
        isPublished: true,
        categoryId: blog.categoryId,
        id: { not: blog.id },
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            profilePhoto: true,
          },
        },
        category: true,
      },
      take: 3,
      orderBy: { publishedAt: 'desc' },
    });

    res.status(200).json({ ...blog, relatedBlogs });
  } catch (error) {
    console.error('Get blog error:', error);
    res.status(500).json({ message: 'Failed to fetch blog!' });
  }
};

// Create new blog (Staff/Admin only)
export const createBlog = async (req, res) => {
  try {
    const {
      title,
      content,
      excerpt,
      seoTitle,
      seoDescription,
      metaKeywords,
      categoryId,
      tags,
      isFeatured,
      isPublished,
      featuredImage,
      images,
    } = req.body;

    const slug = generateSlug(title);
    const readingTime = calculateReadingTime(content);

    // Check if slug already exists
    const existingBlog = await prisma.blog.findUnique({ where: { slug } });
    if (existingBlog) {
      return res
        .status(400)
        .json({ message: 'Blog with this title already exists!' });
    }

    const blog = await prisma.blog.create({
      data: {
        title,
        slug,
        content,
        excerpt: excerpt || content.substring(0, 200),
        seoTitle: seoTitle || title,
        seoDescription: seoDescription || excerpt || content.substring(0, 160),
        metaKeywords: metaKeywords || [],
        readingTime,
        categoryId,
        tags: tags || [],
        isFeatured: isFeatured || false,
        isPublished: isPublished || false,
        publishedAt: isPublished ? new Date() : null,
        featuredImage,
        images: images || [],
        authorId: req.userId,
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            profilePhoto: true,
          },
        },
        category: true,
      },
    });

    res.status(201).json(blog);
  } catch (error) {
    console.error('Create blog error:', error);
    res.status(500).json({ message: 'Failed to create blog!' });
  }
};

// Update blog (Author, Staff, or Admin)
export const updateBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const blog = await prisma.blog.findUnique({ where: { id } });
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found!' });
    }

    // Check permissions
    if (
      req.userRole === 'USER' ||
      (req.userRole === 'STAFF' && blog.authorId !== req.userId)
    ) {
      return res.status(403).json({ message: 'Not authorized!' });
    }

    // Update slug if title changed
    if (updates.title && updates.title !== blog.title) {
      const newSlug = generateSlug(updates.title);
      const existingBlog = await prisma.blog.findUnique({
        where: { slug: newSlug },
      });
      if (existingBlog && existingBlog.id !== id) {
        return res
          .status(400)
          .json({ message: 'Blog with this title already exists!' });
      }
      updates.slug = newSlug;
    }

    // Update reading time if content changed
    if (updates.content) {
      updates.readingTime = calculateReadingTime(updates.content);
    }

    // Set published date if publishing for first time
    if (updates.isPublished && !blog.isPublished) {
      updates.publishedAt = new Date();
    }

    const updatedBlog = await prisma.blog.update({
      where: { id },
      data: { ...updates, updatedAt: new Date() },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            profilePhoto: true,
          },
        },
        category: true,
      },
    });

    res.status(200).json(updatedBlog);
  } catch (error) {
    console.error('Update blog error:', error);
    res.status(500).json({ message: 'Failed to update blog!' });
  }
};

// Delete blog (Author, Staff, or Admin)
export const deleteBlog = async (req, res) => {
  try {
    const { id } = req.params;

    const blog = await prisma.blog.findUnique({ where: { id } });
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found!' });
    }

    // Check permissions
    if (
      req.userRole === 'USER' ||
      (req.userRole === 'STAFF' && blog.authorId !== req.userId)
    ) {
      return res.status(403).json({ message: 'Not authorized!' });
    }

    await prisma.blog.delete({ where: { id } });
    res.status(200).json({ message: 'Blog deleted successfully!' });
  } catch (error) {
    console.error('Delete blog error:', error);
    res.status(500).json({ message: 'Failed to delete blog!' });
  }
};

// Get all blogs for admin/staff (including unpublished)
export const getAllBlogsAdmin = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      category,
      author,
      published,
      sortBy = 'createdAt',
      order = 'desc',
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {
      ...(category && { categoryId: category }),
      ...(author && { authorId: author }),
      ...(published !== undefined && { isPublished: published === 'true' }),
    };

    const [blogs, total] = await Promise.all([
      prisma.blog.findMany({
        where,
        include: {
          author: {
            select: {
              id: true,
              username: true,
              firstName: true,
              lastName: true,
              profilePhoto: true,
            },
          },
          category: true,
          _count: {
            select: { comments: true },
          },
        },
        orderBy: { [sortBy]: order },
        skip,
        take: parseInt(limit),
      }),
      prisma.blog.count({ where }),
    ]);

    res.status(200).json({
      blogs,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        total,
        hasNext: skip + parseInt(limit) < total,
        hasPrev: parseInt(page) > 1,
      },
    });
  } catch (error) {
    console.error('Get admin blogs error:', error);
    res.status(500).json({ message: 'Failed to fetch blogs!' });
  }
};

// Blog Categories CRUD
export const getAllCategories = async (req, res) => {
  try {
    const categories = await prisma.blogCategory.findMany({
      where: { isActive: true },
      include: {
        _count: {
          select: { blogs: { where: { isPublished: true } } },
        },
      },
      orderBy: { name: 'asc' },
    });

    res.status(200).json(categories);
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ message: 'Failed to fetch categories!' });
  }
};

export const createCategory = async (req, res) => {
  try {
    const { name, description, color } = req.body;
    const slug = generateSlug(name);

    const category = await prisma.blogCategory.create({
      data: {
        name,
        slug,
        description,
        color: color || '#3B82F6',
      },
    });

    res.status(201).json(category);
  } catch (error) {
    console.error('Create category error:', error);
    if (error.code === 'P2002') {
      res.status(400).json({ message: 'Category name already exists!' });
    } else {
      res.status(500).json({ message: 'Failed to create category!' });
    }
  }
};

export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (updates.name) {
      updates.slug = generateSlug(updates.name);
    }

    const category = await prisma.blogCategory.update({
      where: { id },
      data: { ...updates, updatedAt: new Date() },
    });

    res.status(200).json(category);
  } catch (error) {
    console.error('Update category error:', error);
    if (error.code === 'P2002') {
      res.status(400).json({ message: 'Category name already exists!' });
    } else {
      res.status(500).json({ message: 'Failed to update category!' });
    }
  }
};

export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if category has blogs
    const blogCount = await prisma.blog.count({ where: { categoryId: id } });
    if (blogCount > 0) {
      return res.status(400).json({
        message: 'Cannot delete category with existing blogs!',
      });
    }

    await prisma.blogCategory.delete({ where: { id } });
    res.status(200).json({ message: 'Category deleted successfully!' });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({ message: 'Failed to delete category!' });
  }
};

// Blog Comments
export const createComment = async (req, res) => {
  try {
    const { blogId, content, parentId } = req.body;

    const comment = await prisma.blogComment.create({
      data: {
        content,
        blogId,
        authorId: req.userId,
        parentId,
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            profilePhoto: true,
          },
        },
      },
    });

    res.status(201).json(comment);
  } catch (error) {
    console.error('Create comment error:', error);
    res.status(500).json({ message: 'Failed to create comment!' });
  }
};

export const approveComment = async (req, res) => {
  try {
    const { id } = req.params;

    const comment = await prisma.blogComment.update({
      where: { id },
      data: { isApproved: true },
    });

    res.status(200).json(comment);
  } catch (error) {
    console.error('Approve comment error:', error);
    res.status(500).json({ message: 'Failed to approve comment!' });
  }
};

export const deleteComment = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.blogComment.delete({ where: { id } });
    res.status(200).json({ message: 'Comment deleted successfully!' });
  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({ message: 'Failed to delete comment!' });
  }
};

export const getAllComments = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      approved,
      blogId,
      search,
      sortBy = 'createdAt',
      order = 'desc',
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {
      ...(approved !== undefined && { isApproved: approved === 'true' }),
      ...(blogId && { blogId }),
      ...(search && {
        OR: [
          { content: { contains: search, mode: 'insensitive' } },
          {
            author: {
              OR: [
                { username: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
              ],
            },
          },
        ],
      }),
    };

    const [comments, total] = await Promise.all([
      prisma.blogComment.findMany({
        where,
        include: {
          author: {
            select: {
              id: true,
              username: true,
              firstName: true,
              lastName: true,
              email: true,
              profilePhoto: true,
            },
          },
          blog: {
            select: {
              id: true,
              title: true,
              slug: true,
            },
          },
        },
        orderBy: { [sortBy]: order },
        skip,
        take: parseInt(limit),
      }),
      prisma.blogComment.count({ where }),
    ]);

    res.status(200).json({
      comments,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        total,
        hasNext: skip + parseInt(limit) < total,
        hasPrev: parseInt(page) > 1,
      },
    });
  } catch (error) {
    console.error('Get comments error:', error);
    res.status(500).json({ message: 'Failed to fetch comments!' });
  }
};

// Get comment statistics (Staff/Admin)
export const getCommentStats = async (req, res) => {
  try {
    const [total, approved, pending] = await Promise.all([
      prisma.blogComment.count(),
      prisma.blogComment.count({ where: { isApproved: true } }),
      prisma.blogComment.count({ where: { isApproved: false } }),
    ]);

    res.status(200).json({
      total,
      approved,
      pending,
    });
  } catch (error) {
    console.error('Get comment stats error:', error);
    res.status(500).json({ message: 'Failed to fetch comment statistics!' });
  }
};
