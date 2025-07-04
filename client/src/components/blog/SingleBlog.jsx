import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  FaEye,
  FaClock,
  FaCalendar,
  FaUser,
  FaShare,
  FaHeart,
} from 'react-icons/fa';
import { AuthContext } from '../../context/AuthContext';
import apiRequest from '../../helper/apiRequest';
import toast from 'react-hot-toast';

const SingleBlog = () => {
  const { slug } = useParams();
  const { currentUser } = useContext(AuthContext);
  const [blog, setBlog] = useState(null);
  const [relatedBlogs, setRelatedBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  useEffect(() => {
    fetchBlog();
  }, [slug]);

  const fetchBlog = async () => {
    try {
      setLoading(true);
      // FIXED: Use the correct API endpoint structure
      const response = await apiRequest.get(`/blog/slug/${slug}`);
      setBlog(response.data);
      setRelatedBlogs(response.data.relatedBlogs || []);
    } catch (error) {
      console.error('Error fetching blog:', error);
      if (error.response?.status === 404) {
        toast.error('Blog post not found');
      } else {
        toast.error('Failed to load blog post');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser) {
      toast.error('Please sign in to comment');
      return;
    }

    if (!commentText.trim()) {
      toast.error('Please enter a comment');
      return;
    }

    try {
      setSubmittingComment(true);
      await apiRequest.post('/blog/comments', {
        blogId: blog.id,
        content: commentText.trim(),
      });

      toast.success('Comment submitted for approval');
      setCommentText('');
      // Optionally refresh the blog to show the new comment if it's auto-approved
      // fetchBlog();
    } catch (error) {
      console.error('Error submitting comment:', error);
      toast.error('Failed to submit comment');
    } finally {
      setSubmittingComment(false);
    }
  };

  const shareUrl = window.location.href;
  const shareTitle = blog?.title || '';

  const handleShare = (platform) => {
    const urls = {
      twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(
        shareUrl
      )}&text=${encodeURIComponent(shareTitle)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
        shareUrl
      )}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
        shareUrl
      )}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(
        shareTitle + ' ' + shareUrl
      )}`,
    };

    window.open(urls[platform], '_blank', 'width=600,height=400');
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">
            Loading blog post...
          </p>
        </div>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="mb-6">
            <svg
              className="mx-auto h-16 w-16 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Blog Post Not Found
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            The blog post you're looking for doesn't exist or may have been
            moved.
          </p>
          <div className="space-y-3">
            <Link
              to="/blog"
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Browse All Posts
            </Link>
            <br />
            <Link to="/" className="text-blue-600 hover:underline">
              Return to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* SEO Meta Tags */}
      <Helmet>
        <title>{blog.seoTitle || blog.title}</title>
        <meta
          name="description"
          content={blog.seoDescription || blog.excerpt}
        />
        <meta name="keywords" content={blog.metaKeywords?.join(', ')} />
        <meta property="og:title" content={blog.title} />
        <meta property="og:description" content={blog.excerpt} />
        <meta property="og:image" content={blog.featuredImage} />
        <meta property="og:url" content={shareUrl} />
        <meta property="og:type" content="article" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={blog.title} />
        <meta name="twitter:description" content={blog.excerpt} />
        <meta name="twitter:image" content={blog.featuredImage} />
        <link rel="canonical" href={shareUrl} />

        {/* Structured Data for SEO */}
        <script type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BlogPosting',
            headline: blog.title,
            description: blog.excerpt,
            image: blog.featuredImage,
            author: {
              '@type': 'Person',
              name: blog.author.firstName || blog.author.username,
            },
            publisher: {
              '@type': 'Organization',
              name: 'PropertyXchange',
            },
            datePublished: blog.publishedAt,
            dateModified: blog.updatedAt,
            mainEntityOfPage: {
              '@type': 'WebPage',
              '@id': shareUrl,
            },
          })}
        </script>
      </Helmet>

      <article className="max-w-4xl mx-auto px-4 py-8 pt-24">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <ol className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
            <li>
              <Link to="/" className="hover:text-blue-600">
                Home
              </Link>
            </li>
            <li className="before:content-['/'] before:mx-2">
              <Link to="/blog" className="hover:text-blue-600">
                Blog
              </Link>
            </li>
            {blog.category && (
              <li className="before:content-['/'] before:mx-2">
                <Link
                  to={`/blog?category=${blog.category.slug}`}
                  className="hover:text-blue-600"
                >
                  {blog.category.name}
                </Link>
              </li>
            )}
            <li className="before:content-['/'] before:mx-2 text-gray-400 truncate">
              {blog.title}
            </li>
          </ol>
        </nav>

        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {blog.category && (
              <span
                className="inline-block px-3 py-1 text-sm font-medium rounded-full"
                style={{
                  backgroundColor: (blog.category.color || '#3B82F6') + '20',
                  color: blog.category.color || '#3B82F6',
                }}
              >
                {blog.category.name}
              </span>
            )}
            {blog.isFeatured && (
              <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2 py-1 rounded-full">
                Featured
              </span>
            )}
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
            {blog.title}
          </h1>

          {blog.excerpt && (
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
              {blog.excerpt}
            </p>
          )}

          {/* Meta Information */}
          <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600 dark:text-gray-400 mb-6">
            <div className="flex items-center gap-2">
              <img
                src={blog.author?.profilePhoto || '/default-avatar.png'}
                alt={blog.author?.username || 'Author'}
                className="w-8 h-8 rounded-full object-cover"
                onError={(e) => {
                  e.target.src = '/default-avatar.png';
                }}
              />
              <span>
                By{' '}
                <span className="font-medium">
                  {blog.author?.firstName ||
                    blog.author?.username ||
                    'Anonymous'}
                </span>
              </span>
            </div>

            <div className="flex items-center gap-1">
              <FaCalendar className="w-4 h-4" />
              <span>{formatDate(blog.publishedAt || blog.createdAt)}</span>
            </div>

            {blog.readingTime && (
              <div className="flex items-center gap-1">
                <FaClock className="w-4 h-4" />
                <span>{blog.readingTime} min read</span>
              </div>
            )}

            <div className="flex items-center gap-1">
              <FaEye className="w-4 h-4" />
              <span>{blog.viewCount || 0} views</span>
            </div>
          </div>

          {/* Tags */}
          {blog.tags && blog.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {blog.tags.map((tag, index) => (
                <Link
                  key={index}
                  to={`/blog?tag=${tag}`}
                  className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-3 py-1 rounded-full text-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  #{tag}
                </Link>
              ))}
            </div>
          )}

          {/* Share Buttons */}
          <div className="flex items-center gap-4 pb-6 border-b border-gray-200 dark:border-gray-700">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Share:
            </span>
            <button
              onClick={() => handleShare('twitter')}
              className="p-2 rounded-full bg-blue-500 text-white hover:bg-blue-600 transition-colors"
              title="Share on Twitter"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
              </svg>
            </button>

            <button
              onClick={() => handleShare('facebook')}
              className="p-2 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-colors"
              title="Share on Facebook"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
            </button>

            <button
              onClick={() => handleShare('linkedin')}
              className="p-2 rounded-full bg-blue-700 text-white hover:bg-blue-800 transition-colors"
              title="Share on LinkedIn"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
            </button>

            <button
              onClick={() => handleShare('whatsapp')}
              className="p-2 rounded-full bg-green-500 text-white hover:bg-green-600 transition-colors"
              title="Share on WhatsApp"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488" />
              </svg>
            </button>
          </div>
        </header>

        {/* Featured Image */}
        {blog.featuredImage && (
          <div className="mb-8">
            <img
              src={blog.featuredImage}
              alt={blog.title}
              className="w-full h-64 md:h-96 object-cover rounded-lg shadow-lg"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          </div>
        )}

        {/* Content */}
        <div className="prose prose-lg dark:prose-invert max-w-none mb-12 leading-relaxed">
          <div dangerouslySetInnerHTML={{ __html: blog.content }} />
        </div>

        {/* Author Bio */}
        {blog.author && (
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 mb-12">
            <div className="flex items-start space-x-4">
              <img
                src={blog.author.profilePhoto || '/default-avatar.png'}
                alt={blog.author.username || 'Author'}
                className="w-16 h-16 rounded-full object-cover"
                onError={(e) => {
                  e.target.src = '/default-avatar.png';
                }}
              />
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  {blog.author.firstName && blog.author.lastName
                    ? `${blog.author.firstName} ${blog.author.lastName}`
                    : blog.author.username || 'Anonymous'}
                </h3>
                {blog.author.aboutCompany && (
                  <p className="text-gray-600 dark:text-gray-400 mb-3">
                    {blog.author.aboutCompany}
                  </p>
                )}
                <div className="flex space-x-3">
                  {blog.author.linkedInLink && (
                    <a
                      href={blog.author.linkedInLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-700"
                    >
                      LinkedIn
                    </a>
                  )}
                  {blog.author.twitterLink && (
                    <a
                      href={blog.author.twitterLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-500"
                    >
                      Twitter
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Comments Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Comments ({blog.comments?.length || 0})
          </h2>

          {/* Comment Form */}
          {currentUser ? (
            <form onSubmit={handleCommentSubmit} className="mb-8">
              <div className="flex items-start space-x-4">
                <img
                  src={currentUser.profilePhoto || '/default-avatar.png'}
                  alt={currentUser.username}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div className="flex-1">
                  <textarea
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Share your thoughts..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  />
                  <div className="flex justify-end mt-2">
                    <button
                      type="submit"
                      disabled={submittingComment || !commentText.trim()}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {submittingComment ? 'Submitting...' : 'Post Comment'}
                    </button>
                  </div>
                </div>
              </div>
            </form>
          ) : (
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-8 text-center">
              <p className="text-gray-600 dark:text-gray-400">
                <Link to="/sign-in" className="text-blue-600 hover:underline">
                  Sign in
                </Link>{' '}
                to join the conversation
              </p>
            </div>
          )}

          {/* Comments List */}
          <div className="space-y-6">
            {blog.comments?.map((comment) => (
              <div key={comment.id} className="flex items-start space-x-4">
                <img
                  src={comment.author?.profilePhoto || '/default-avatar.png'}
                  alt={comment.author?.username || 'Commenter'}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div className="flex-1">
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {comment.author?.firstName ||
                          comment.author?.username ||
                          'Anonymous'}
                      </h4>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(comment.createdAt)}
                      </span>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300">
                      {comment.content}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Related Posts */}
        {relatedBlogs.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Related Posts
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedBlogs.map((relatedBlog) => (
                <Link
                  key={relatedBlog.id}
                  to={`/blog/${relatedBlog.slug}`}
                  className="group"
                >
                  <article className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                    {relatedBlog.featuredImage && (
                      <img
                        src={relatedBlog.featuredImage}
                        alt={relatedBlog.title}
                        className="w-full h-32 object-cover group-hover:scale-105 transition-transform"
                      />
                    )}
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
                        {relatedBlog.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                        {relatedBlog.excerpt}
                      </p>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          </section>
        )}
      </article>
    </>
  );
};

export default SingleBlog;
