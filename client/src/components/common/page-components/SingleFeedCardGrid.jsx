import { FiArrowRight, FiEye, FiClock } from 'react-icons/fi';
import { Link } from 'react-router-dom';

const SingleFeedCardGrid = ({
  id,
  slug,
  title,
  excerpt,
  featuredImage,
  category,
  author,
  publishedAt,
  createdAt,
  viewCount,
  readingTime,
  isFeatured,
  // Fallback props for backward compatibility
  date_posted,
  image,
  description,
}) => {
  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Use blog API data with fallbacks to old dummy data
  const blogData = {
    id: id,
    slug: slug,
    title: title,
    excerpt: excerpt || description,
    featuredImage: featuredImage || image,
    category: category,
    author: author,
    publishedDate: publishedAt || createdAt || date_posted,
    viewCount: viewCount || 0,
    readingTime: readingTime || 5,
    isFeatured: isFeatured || false,
  };

  return (
    <article className="flex flex-col gap-3 sm:flex-row group bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 border border-gray-200 dark:border-gray-700">
      <div className="relative flex-shrink-0">
        <Link to={`/blog/${blogData.slug}`}>
          <img
            src={blogData.featuredImage || '/default-blog-image.jpg'}
            alt={blogData.title}
            className="object-cover w-full h-64 sm:w-48 sm:h-full group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              e.target.src = '/default-blog-image.jpg';
            }}
          />
        </Link>

        {/* Featured Badge */}
        {blogData.isFeatured && (
          <div className="absolute top-3 left-3">
            <span
              className="px-3 py-1 text-white text-xs font-medium capitalize rounded-full shadow-md"
              style={{
                backgroundColor: blogData.category?.color || '#3B82F6',
              }}
            >
              {blogData.category?.name || blogData.category || 'Blog'}
            </span>
          </div>
        )}
      </div>

      <div className="flex-1 p-4 sm:p-6">
        {/* Title */}
        <Link
          to={`/blog/${blogData.slug}`}
          className="group-hover:text-primary transition-colors duration-300"
        >
          <h2 className="text-lg sm:text-xl font-semibold line-clamp-2 mb-3 text-gray-900 dark:text-white leading-tight">
            {blogData.title}
          </h2>
        </Link>

        {/* Meta Info */}
        <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-3">
          <div className="flex items-center gap-1">
            <img
              src={blogData.author?.profilePhoto || '/default-avatar.png'}
              alt={
                blogData.author?.firstName ||
                blogData.author?.username ||
                blogData.author?.name ||
                'Author'
              }
              className="w-5 h-5 rounded-full object-cover"
              onError={(e) => {
                e.target.src = '/default-avatar.png';
              }}
            />
            <span className="font-medium">
              {blogData.author?.firstName ||
                blogData.author?.username ||
                blogData.author?.name ||
                'Anonymous'}
            </span>
          </div>

          <span>•</span>

          <time dateTime={blogData.publishedDate}>
            {formatDate(blogData.publishedDate)}
          </time>

          {blogData.readingTime && (
            <>
              <span>•</span>
              <div className="flex items-center gap-1">
                <FiClock className="w-3 h-3" />
                <span>{blogData.readingTime} min read</span>
              </div>
            </>
          )}
        </div>

        {/* Excerpt */}
        <p className="text-gray-700 dark:text-gray-300 mb-4 line-clamp-3 leading-relaxed">
          {blogData.excerpt?.length > 180
            ? `${blogData.excerpt.substring(0, 180)}...`
            : blogData.excerpt}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
            {blogData.viewCount > 0 && (
              <div className="flex items-center gap-1">
                <FiEye className="w-4 h-4" />
                <span>{blogData.viewCount.toLocaleString()} views</span>
              </div>
            )}
          </div>

          <Link
            to={`/blog/${blogData.slug}`}
            className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-medium text-sm group-hover:gap-3 transition-all duration-300"
          >
            <span>Read More</span>
            <FiArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </article>
  );
};

export default SingleFeedCardGrid;
