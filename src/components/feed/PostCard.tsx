import React, { memo } from 'react';
import { Post } from '../../types';
import { formatTimeAgo } from '../../utils/time';

import { FaHeart, FaComment, FaShare } from "react-icons/fa";
import { IconBaseProps } from 'react-icons';

interface PostCardProps {
  post: Post;
  onInteraction: (action: string) => void;
  index: number;
}

const PostCard: React.FC<PostCardProps> = memo(
  ({ post, onInteraction, index }) => {
    const interactions = [
      {
        name: 'Like',
        Icon: FaHeart as React.ComponentType<IconBaseProps>,
        count: post.likes,
        activeColor: 'text-red-500',
        isActive: post.isLiked,
        hoverColor: 'hover:text-red-500',
        isDisabled: true,
      },
      {
        name: 'Comment',
        Icon: FaComment as React.ComponentType<IconBaseProps>,
        count: post.comments,
        activeColor: 'text-blue-500',
        isActive: false,
        hoverColor: 'hover:text-blue-500',
        isDisabled: true,
      },
      {
        name: 'Share',
        Icon: FaShare as React.ComponentType<IconBaseProps>,
        count: null,
        activeColor: 'text-green-500',
        isActive: false,
        hoverColor: 'hover:text-green-500',
        isDisabled: true,
      },
    ];

    const emojis = ['🤯', '💀', '🤞', '🍉', '🎸'];

    return (
      <div className='bg-[#00000008] pt-2 px-3 rounded-3xl'>
        <div className='bg-white rounded-3xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow h-full'>
          <div className='flex flex-col gap-2'>
            <div className='flex gap-3 items-center'>
              <div> {post?.author?.avatar}</div>

              <div className='flex flex-col'>
                <h3 className='font-semibold text-[13px] text-gray-900'>{post.author.name}</h3>
                <span className='text-xs text-gray-500'>{formatTimeAgo(post.createdAt)}</span>
              </div>
            </div>

            <div className='flex gap-2'>
              <div className='text-2xl'>{emojis[Math.floor(Math.random() * 5)]}</div>
              <p className='text-[#000000D4] text-sm font-medium whitespace-pre-wrap'>{post.content}</p>
            </div>
          </div>
        </div>

        <div className='flex gap-4 p-4'>
          {interactions.map((interaction) => {
            const Icon = interaction.Icon;

            return (
              <button
                key={interaction.name}
                disabled={interaction.isDisabled}
                onClick={() => onInteraction(interaction.name)}
                className={`flex items-center gap-2 transition-all duration-200 ${
                  interaction.isActive
                    ? interaction.activeColor
                    : `text-gray-600 ${interaction.hoverColor}`
                }`}
              >
                <Icon className={interaction.isActive ? 'scale-110' : 'hover:scale-110'} />

                {interaction.count !== null && (
                  <span className="text-sm">{interaction.count}</span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  },
  (prevProps, nextProps) => {
    return (
      prevProps.post.id === nextProps.post.id &&
      prevProps.post.likes === nextProps.post.likes &&
      prevProps.post.comments === nextProps.post.comments &&
      prevProps.post.isLiked === nextProps.post.isLiked &&
      prevProps.index === nextProps.index
    );
  },
);

PostCard.displayName = 'PostCard';

export default PostCard;