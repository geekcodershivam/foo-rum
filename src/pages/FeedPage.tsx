import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import PostEditor from '../components/feed/PostEditor';
import PostCard from '../components/feed/PostCard';
import VirtualScroller from '../components/common/VirtualScroller';
import Button from '../components/common/Button';
import { Post } from '../types';
import Avatars from '../components/icons/Avatars';
import { IoLogInOutline } from "react-icons/io5";

// Generate mock posts for testing
const generateMockPosts = (count: number, startId: number = 1): Post[] => {
  const posts: Post[] = [];
  const mockAuthors = [
    { id: '1', name: 'Sarah Johnson', email: 'sarah@example.com' },
    { id: '2', name: 'Mike Chen', email: 'mike@example.com' },
    { id: '3', name: 'Emily Davis', email: 'emily@example.com' },
    { id: '4', name: 'Alex Rodriguez', email: 'alex@example.com' },
    { id: '5', name: 'Jessica Kim', email: 'jessica@example.com' },
  ];

  const contentTemplates = [
    "Just shipped a new feature! 🚀 Feeling accomplished today. There's nothing quite like the satisfaction of seeing your code come to life.",
    'Coffee ☕ + Code 💻 = Perfect morning! Who else is coding on this beautiful day?',
    "Working on some exciting improvements to our app. The team has been incredible, and I'm learning so much every day.",
    "Love the team collaboration today! Great ideas all around. It's amazing what we can achieve when we work together.",
    'Debugging is like being a detective in a crime movie where you are also the murderer. 😅',
    'Just learned something new about TypeScript. Mind blown! 🤯 The type system is more powerful than I initially thought.',
    'Taking a break from coding to recharge. Self-care is important! Remember to step away from the screen occasionally.',
    'Code review done! Always great to learn from the team. Every review is an opportunity to grow.',
    'Optimizing performance today. Every millisecond counts! Our users deserve the best experience possible.',
    'Building something amazing with React. The possibilities are endless! What are you building today?',
  ];

  for (let i = 0; i < count; i++) {
    const author = mockAuthors[i % mockAuthors.length];
    const contentIndex = i % contentTemplates.length;
    const extraContent = Math.random() > 0.5 ? '\n\nCheck out my latest blog post about this topic! Link in bio.' : '';

    posts.push({
      id: `${startId + i}`,
      content: `${contentTemplates[contentIndex]}${extraContent} #post${startId + i}`,
      author: {
        ...author,
        avatar: Avatars(Math.floor(Math.random() * 3)),
      },
      createdAt: new Date(Date.now() - i * 3600000),
      likes: Math.floor(Math.random() * 100),
      comments: Math.floor(Math.random() * 20),
      isLiked: Math.random() > 0.7,
    });
  }

  return posts;
};

const BATCH_SIZE = 50;

const FeedPage: React.FC = () => {
  const { user, isAuthenticated, setShowAuthModal, logout } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [totalPosts] = useState(10000);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMorePosts, setHasMorePosts] = useState(true);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [newPostIds, setNewPostIds] = useState<string[]>([]);
  const editorRef = useRef<HTMLDivElement>(null);

  // Variable height calculation based on content
  const getItemHeight = useCallback(
    (index: number): number => {
      const post = posts[index];
      if (!post) return 250;

      // More accurate height calculation
      const contentLength = post.content.length;
      const baseHeight = 180; // Base height for card UI elements (avatar, buttons, padding)
      
      // Estimate lines based on average characters per line
      const charsPerLine = 65; // Average for the card width
      const estimatedLines = Math.ceil(contentLength / charsPerLine);
      const lineHeight = 24; // Tailwind's default line height for text-base
      const contentHeight = estimatedLines * lineHeight;
      
      // Add padding and margins
      const totalHeight = baseHeight + contentHeight + 20; // Extra 20px for safety margin

      return Math.min(totalHeight, 600); // Max height to prevent extremely tall posts
    },
    [posts],
  );

  // Initialize with first batch
  useEffect(() => {
    const loadInitialPosts = async () => {
      await new Promise((resolve) => setTimeout(resolve, 300));
      const initialPosts = generateMockPosts(BATCH_SIZE * 2); // Load more initially
      setPosts(initialPosts);
      setIsInitialLoading(false);
    };

    loadInitialPosts();
  }, []);

  // Handle scroll to show/hide scroll to top button
  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.pageYOffset || document.documentElement.scrollTop;
      setShowScrollTop(scrolled > 500);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleAuthRequired = useCallback(() => {
    if (!isAuthenticated) {
      setShowAuthModal(true);
      return false;
    }
    return true;
  }, [isAuthenticated, setShowAuthModal]);

  const handlePublishPost = async (content: string) => {
    await new Promise((resolve) => setTimeout(resolve, 300));

    const newPost: Post = {
      id: `new-${Date.now()}`,
      content,
      author: {
        ...user!,
        avatar: Avatars(Math.floor(Math.random() * 3)),
      },
      createdAt: new Date(),
      likes: 0,
      comments: 0,
      isLiked: false,
    };

    setPosts((prev) => [newPost, ...prev]);

    // Track new post for animation
    setNewPostIds((prev) => [...prev, newPost.id]);

    // Remove from new posts after animation
    setTimeout(() => {
      setNewPostIds((prev) => prev.filter((id) => id !== newPost.id));
    }, 3000);

    // Smooth scroll to top with a slight delay to see the animation
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);
  };

  // Optimistic update for interactions
  const handleInteraction = useCallback(
    (action: string, postId?: string) => {
      // Check authentication
      if (!isAuthenticated) {
        setShowAuthModal(true);
        return;
      }

      // Optimistic update for like action
      if (action === 'Like' && postId) {
        setPosts((prev) =>
          prev.map((post) => {
            if (post.id === postId) {
              return {
                ...post,
                isLiked: !post.isLiked,
                likes: post.isLiked ? post.likes - 1 : post.likes + 1,
              };
            }
            return post;
          }),
        );

        // Simulate API call
        setTimeout(() => {
          // In real app, revert on error
        }, 500);
      } else {
        alert(`Function '${action}' not implemented`);
      }
    },
    [isAuthenticated, setShowAuthModal],
  );

  const handleToolClick = useCallback(
    (tool: string) => {
      handleInteraction(tool);
    },
    [handleInteraction],
  );

  // Load more posts
  const handleLoadMore = useCallback(() => {
    if (isLoadingMore || !hasMorePosts || posts.length >= totalPosts) return;

    setIsLoadingMore(true);

    setTimeout(() => {
      const currentLength = posts.length;
      const remainingPosts = totalPosts - currentLength;
      const nextBatchSize = Math.min(BATCH_SIZE, remainingPosts);

      if (nextBatchSize > 0) {
        const newPosts = generateMockPosts(nextBatchSize, currentLength + 1);
        setPosts((prev) => [...prev, ...newPosts]);

        if (currentLength + nextBatchSize >= totalPosts) {
          setHasMorePosts(false);
        }
      } else {
        setHasMorePosts(false);
      }

      setIsLoadingMore(false);
    }, 500);
  }, [isLoadingMore, hasMorePosts, posts.length, totalPosts]);

  // Render function with optimistic updates
  const renderPost = useCallback(
    (post: Post, index: number) => {
      const isNew = newPostIds.includes(post.id);
      return (
        <div className={`max-w-[645px] mx-auto ${isNew ? 'animate-slide-down' : ''}`}>
          <div className={isNew ? 'ring-2 ring-blue-500 ring-opacity-50 rounded-lg transition-all duration-1000' : ''}>
            <PostCard post={post} onInteraction={(action) => handleInteraction(action, post.id)} index={index} />
          </div>
        </div>
      );
    },
    [handleInteraction, newPostIds],
  );

  // Scroll to editor
  const scrollToEditor = () => {
    editorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const FooRumLogo = () => {
    return (
      <svg width='34' height='34' viewBox='0 0 34 34' fill='none' xmlns='http://www.w3.org/2000/svg'>
        <path
          d='M22.6666 17H19.8333M2.83329 17V17C2.83329 23.2592 7.90741 28.3333 14.1666 28.3333H19.8333C26.0925 28.3333 31.1666 23.2592 31.1666 17V17C31.1666 10.7407 26.0925 5.66663 19.8333 5.66663H14.1666C7.9074 5.66663 2.83329 10.7407 2.83329 17Z'
          stroke='black'
          stroke-width='3.5'
          stroke-linecap='round'
          stroke-linejoin='round'
        />
      </svg>
    );
  };

  return (
    <div className='min-h-screen bg-white'>
      {/* Header */}
      <header className='bg-white sticky top-0 z-40'>
        <div className='mx-auto px-4 py-4 flex justify-between items-center'>
          <h3 className='font-bold text-gray-900 flex gap-2 items-center'>
            <FooRumLogo /> <span>foo-rum</span>
          </h3>
          <div className='flex items-center gap-4'>
            {isAuthenticated ? (
              <>
                <div className='flex items-center gap-3'>
                  <div className='rounded-lg'>{user?.avatar}</div>
                  <span className='text-sm font-medium text-gray-700'>{user?.name}</span>
                </div>
                <Button className='!border-red-400 border text-red-400' onClick={logout} variant='ghost' size='sm'>
                  Logout
                </Button>
              </>
            ) : (
              <div className='flex items-center gap-3'>
                <Link to='/signin'>
                  <Button variant='ghost' size='sm'>
                    Sign In 
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Post Editor */}
      <div ref={editorRef} className='max-w-2xl mx-auto px-4 py-8'>
        <PostEditor
          user={user}
          onPublish={handlePublishPost}
          onAuthRequired={handleAuthRequired}
          onToolClick={handleToolClick}
        />
      </div>

      {isInitialLoading ? (
        <div className='flex items-center justify-center h-64'>
          <div className='text-center'>
            <svg className='animate-spin h-8 w-8 text-blue-600 mx-auto mb-4' fill='none' viewBox='0 0 24 24'>
              <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4' />
              <path
                className='opacity-75'
                fill='currentColor'
                d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
              />
            </svg>
            <p className='text-gray-500'>Loading your feed...</p>
          </div>
        </div>
      ) : (
        <>
          <VirtualScroller
            items={posts}
            getItemHeight={getItemHeight}
            renderItem={renderPost}
            overscan={3}
            onLoadMore={handleLoadMore}
            seamless={true}
            gap={0}
          />

          {/* Loading more indicator */}
          {isLoadingMore && (
            <div className='py-8 text-center'>
              <div className='inline-flex items-center gap-2 text-gray-600'>
                <svg className='animate-spin h-5 w-5' fill='none' viewBox='0 0 24 24'>
                  <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4' />
                  <path
                    className='opacity-75'
                    fill='currentColor'
                    d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                  />
                </svg>
                <span>Loading more posts...</span>
              </div>
            </div>
          )}

          {/* End of feed */}
          {!hasMorePosts && posts.length > 0 && (
            <div className='py-12 text-center'>
              <p className='text-gray-500 mb-4'>You've reached the end! 🎉</p>
              <Button onClick={scrollToEditor} variant='secondary' size='sm'>
                Create a new post
              </Button>
            </div>
          )}
        </>
      )}

      {/* Floating buttons */}
      <div className='fixed bottom-6 right-6 flex flex-col gap-4'>
        {/* Scroll to top button */}
        {showScrollTop && (
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className='w-12 h-12 bg-gray-800 text-white rounded-full shadow-lg hover:bg-gray-700 transition-all hover:scale-110 flex items-center justify-center animate-fade-in'
            aria-label='Scroll to top'
          >
            <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M5 10l7-7m0 0l7 7m-7-7v18' />
            </svg>
          </button>
        )}

        {/* Compose button for mobile */}
        {isAuthenticated && (
          <button
            onClick={scrollToEditor}
            className='w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-all hover:scale-110 flex items-center justify-center lg:hidden'
            aria-label='Create post'
          >
            <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 4v16m8-8H4' />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

export default FeedPage;
