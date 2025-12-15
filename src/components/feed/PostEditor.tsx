import React, { useEffect, useRef, useState } from 'react';
import { User } from '../../types';
import SendIcon from '../icons/SendIcon';
import Bold from '../icons/BoldIcon';
import ItalicIcon from '../icons/ItalicIcon';
import ListIcon from '../icons/ListIcon';
import OListIcon from '../icons/OListIcon';
import NumberIcon from '../icons/NumberIcon';
import CodeIcon from '../icons/CodeIcon';
import UnderlineIcon from '../icons/UnderlineIcon';
import DeleteIcon from '../icons/DeleteIcon';

import {
  FaBell,
  FaPlus,
  FaMicrophone,
} from "react-icons/fa";
import { IconBaseProps } from 'react-icons';

interface PostEditorProps {
  user: User | null;
  onPublish: (content: string) => Promise<void>;
  onAuthRequired: () => boolean;
  onToolClick: (tool: string) => void;
}

const PostEditor: React.FC<PostEditorProps> = ({ user, onPublish, onAuthRequired, onToolClick }) => {
  const [content, setContent] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (contentRef.current) {
      const text = contentRef.current.innerText?.trim();
      if (!text) {
        contentRef.current.classList.add('is-empty');
      }
    }
  }, []);

  const handleInput = () => {
    const text = contentRef.current?.innerText?.trim() || '';
    setContent(text);

    if (contentRef.current) {
      if (text === '') {
        contentRef.current.classList.add('is-empty');
      } else {
        contentRef.current.classList.remove('is-empty');
      }
    }
  };

  const handlePublish = async () => {
    if (!onAuthRequired()) return;
    if (!content.trim()) return;

    // Start posting animation
    setIsPosting(true);

    // Add pulse animation to the editor
    if (editorRef.current) {
      editorRef.current.classList.add('animate-pulse');
    }

    // Clear content with fade out effect
    if (contentRef.current) {
      contentRef.current.classList.add('opacity-50', 'transition-opacity', 'duration-300');
    }

    await onPublish(content);

    // Show success animation
    setShowSuccess(true);

    // Clear content
    setContent('');
    if (contentRef.current) {
      contentRef.current.innerText = '';
      contentRef.current.classList.add('is-empty');
      contentRef.current.classList.remove('opacity-50');
    }

    // Remove pulse animation
    if (editorRef.current) {
      editorRef.current.classList.remove('animate-pulse');
    }

    // Hide success after animation
    setTimeout(() => {
      setShowSuccess(false);
      setIsPosting(false);
    }, 2000);
  };

  const tools = [
    {
      name: 'file',
      Icon: FaPlus as React.ComponentType<IconBaseProps>,
      isDisabled: true,
    },
    { name: 'audio', Icon: FaMicrophone as React.ComponentType<IconBaseProps>, isDisabled: true, },
    { name: 'video', Icon: FaBell as React.ComponentType<IconBaseProps> , isDisabled: true, },

  ];

  return (
    <div className='bg-[#00000008] p-2 rounded-3xl relative'>
      {/* Success animation overlay */}
      {showSuccess && (
        <div className='absolute inset-0 flex items-center justify-center z-50 -top-40 pointer-events-none'>
          <div className='bg-green-500 text-white px-6 py-3 rounded-full shadow-lg animate-bounce-in flex items-center gap-2'>
            <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M5 13l4 4L19 7' />
            </svg>
            <span className='font-medium'>Posted successfully!</span>
          </div>
        </div>
      )}

      <div
        ref={editorRef}
        className={`bg-[#FFFFFF] rounded-3xl shadow-sm border border-[#00000021] animate-fade-in transition-all duration-300 ${showSuccess ? 'scale-95 opacity-90' : ''
          }`}
      >
        <div className='flex flex-col bg-white rounded-3xl'>
          <div className='flex justify-between m-2'>
            <div className='bg-[#00000008] py-1 px-2 flex items-center justify-between rounded-xl w-10/12 cursor-pointer'>
              {/* Paragraph Dropdown */}
              <div className='text-xs flex items-center bg-white p-2 rounded-md font-medium shadow-md cursor-not-allowed'>
                Paragraph
                <span className='ml-1'>▼</span>
              </div>

              {/* Group 1: Bold, Italic, Underline */}
              <div className='flex items-center justify-around w-1/6'>
                <div className='bg-white p-2 rounded-md shadow-md'>
                  <Bold />
                </div>
                <div className='p-2 rounded-md cursor-not-allowed'>
                  <ItalicIcon />
                </div>
                <div className='p-2 rounded-md cursor-not-allowed'>
                  <UnderlineIcon />
                </div>
              </div>
              {/* Divider */}
              <div className='h-6 border-l border-[#0000001A] mx-1'/>

              {/* Group 2: Bullet and Numbered List */}
              <div className='flex items-center gap-1'>
                <div className='p-2 rounded-md cursor-not-allowed'>
                  <ListIcon />
                </div>
                <div className='p-2 rounded-md cursor-not-allowed'>
                  <OListIcon />
                </div>
              </div>

              {/* Divider */}
              <div className='h-6 border-l border-[#0000001A] mx-1'></div>

              {/* Group 3: 99 and Code Icon */}
              <div className='flex items-center gap-1'>
                <div className='p-2 rounded-md cursor-not-allowed'>
                  <NumberIcon />
                </div>
                <div className='p-2 rounded-md cursor-not-allowed'>
                  <CodeIcon />
                </div>
              </div>
            </div>

            <div className='py-1 px-2 bg-red-50 rounded-lg flex items-center cursor-not-allowed' >
              <DeleteIcon />
            </div>
          </div>

          <div
            contentEditable
            ref={contentRef}
            onInput={handleInput}
            onFocus={() => onAuthRequired()}
            data-placeholder='How are you feeling today?'
            className='relative w-full rounded-3xl p-4 min-h-[72px] resize-none focus:outline-none placeholder-gray-400'
            suppressContentEditableWarning
          />

          <div className='border-b-[#D9D9D9] border-b'></div>

          <div className='flex justify-between items-center p-2'>
            <div className='flex gap-2'>
              {tools.map((tool) => {
                const Icon = tool?.Icon;
                return(
                <button
                  disabled={tool.isDisabled}
                  key={tool.name}
                  onClick={() => onToolClick(`Add ${tool.name}`)}
                  className={`p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors`}
                  aria-label={`Add ${tool.name}`}
                >
                  <Icon />
                </button>
              )})}
            </div>
            <button
              className={`transition-all duration-300 ${!content.trim() ? 'opacity-40' : 'hover:scale-110 active:scale-95'
                }`}
              onClick={handlePublish}
              disabled={!content.trim() || isPosting}
            >
              <SendIcon />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostEditor;
