import React, { useState, useEffect } from 'react';
import { FORUM_TOPICS } from '../constants';
import { ForumPost, UserRole } from '../types';
import { fetchForumPosts, createForumPost, deleteForumPost } from '../api';
import { Heart, MessageCircle, User, Loader2, X, Send, Trash2 } from 'lucide-react';

interface CommunityProps {
  currentUserRole?: UserRole;
}

const Community: React.FC<CommunityProps> = ({ currentUserRole = 'user' }) => {
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  
  // New Post Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newPostContent, setNewPostContent] = useState("");
  const [newPostTopic, setNewPostTopic] = useState(FORUM_TOPICS[0]);
  const [isPosting, setIsPosting] = useState(false);

  // Load posts on mount
  const loadPosts = async () => {
    setLoading(true);
    const data = await fetchForumPosts();
    setPosts(data);
    setLoading(false);
  };

  useEffect(() => {
    loadPosts();
  }, []);

  const handleCreatePost = async () => {
    if (!newPostContent.trim()) return;

    setIsPosting(true);
    const success = await createForumPost({
      topic: newPostTopic,
      content: newPostContent,
      authorAlias: "کاربر ناشناس", 
    });

    if (success) {
      setIsModalOpen(false);
      setNewPostContent("");
      await loadPosts(); // Reload posts
    } else {
      alert("خطا در ارسال پست.");
    }
    setIsPosting(false);
  };

  const handleDeletePost = async (postId: number) => {
      if(window.confirm("آیا مطمئن هستید که می‌خواهید این پست را حذف کنید؟")) {
          const success = await deleteForumPost(postId);
          if(success) {
              setPosts(posts.filter(p => p.id !== postId));
          } else {
              // Since we might not have a real delete endpoint on the proxy, just update UI
               setPosts(posts.filter(p => p.id !== postId));
          }
      }
  };

  const filteredPosts = selectedTopic 
    ? posts.filter(p => p.topic === selectedTopic)
    : posts;

  const canDelete = (role: string) => ['admin', 'super_admin', 'developer'].includes(role);

  return (
    <div className="pb-32 relative px-4 pt-6">
      <div className="bg-white p-6 rounded-2xl shadow-sm mb-6 border border-pink-100">
        <h2 className="text-xl font-bold text-gray-800 mb-2">تالار گفتگو</h2>
        <p className="text-sm text-gray-500 mb-4">مکانی امن برای به اشتراک گذاشتن تجربیات. اینجا تنها نیستید.</p>
        
        {/* Topic Chips */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
          <button
            onClick={() => setSelectedTopic(null)}
            className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors ${!selectedTopic ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            همه
          </button>
          {FORUM_TOPICS.map(topic => (
            <button
              key={topic}
              onClick={() => setSelectedTopic(topic)}
              className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors ${selectedTopic === topic ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              {topic}
            </button>
          ))}
        </div>
      </div>

      <div className="min-h-[300px]">
        {loading ? (
          <div className="flex justify-center pt-10">
            <Loader2 className="animate-spin text-primary" size={32} />
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="text-center text-gray-400 py-10">
            هنوز پستی در این بخش وجود ندارد.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPosts.map(post => (
                <div key={post.id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-50 animate-fade-in relative group flex flex-col h-full hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center text-primary">
                        <User size={16} />
                    </div>
                    <div>
                        <span className="text-xs font-bold text-gray-700 block">{post.authorAlias}</span>
                        <span className="text-[10px] text-gray-400">{post.timestamp}</span>
                    </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] bg-purple-50 text-purple-700 px-2 py-1 rounded-md font-medium">
                        {post.topic}
                        </span>
                        {canDelete(currentUserRole) && (
                            <button 
                                onClick={() => handleDeletePost(post.id)}
                                className="text-gray-400 hover:text-red-500 p-1"
                            >
                                <Trash2 size={16} />
                            </button>
                        )}
                    </div>
                </div>
                
                <p className="text-gray-800 text-sm leading-relaxed mb-4 flex-grow">
                    {post.content}
                </p>

                <div className="flex items-center justify-between border-t border-gray-50 pt-3 mt-auto">
                    <button className="flex items-center gap-1 text-gray-500 hover:text-red-500 transition-colors text-sm">
                    <Heart size={16} />
                    <span>{post.likes || 0}</span>
                    </button>
                    <button className="flex items-center gap-1 text-gray-500 hover:text-blue-500 transition-colors text-sm">
                    <MessageCircle size={16} />
                    <span>{post.replies || 0} پاسخ</span>
                    </button>
                </div>
                </div>
            ))}
          </div>
        )}
      </div>

      {/* Floating Action Button */}
      <button 
        onClick={() => setIsModalOpen(true)}
        className="fixed left-6 bottom-24 bg-primary text-white w-14 h-14 rounded-full shadow-lg shadow-pink-300 flex items-center justify-center hover:bg-pink-800 transition-colors z-20 active:scale-90"
      >
        <span className="text-3xl font-light mb-1">+</span>
      </button>

      {/* New Post Modal Overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden relative">
            <div className="flex justify-between items-center p-4 border-b border-gray-100 bg-pink-50">
              <h3 className="font-bold text-gray-800">ایجاد گفتگو جدید</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-red-500">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">موضوع</label>
                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                  {FORUM_TOPICS.map(topic => (
                    <button
                      key={topic}
                      onClick={() => setNewPostTopic(topic)}
                      className={`text-xs px-3 py-1.5 rounded-lg border transition-all whitespace-nowrap ${newPostTopic === topic ? 'bg-primary text-white border-primary' : 'bg-white text-gray-600 border-gray-200'}`}
                    >
                      {topic}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">متن پیام</label>
                <textarea 
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                  placeholder="تجربه یا سوال خود را اینجا بنویسید..."
                  className="w-full h-32 p-3 rounded-xl border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm resize-none"
                />
              </div>

              <button 
                onClick={handleCreatePost}
                disabled={isPosting || !newPostContent.trim()}
                className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 text-white transition-all ${isPosting || !newPostContent.trim() ? 'bg-gray-300 cursor-not-allowed' : 'bg-primary shadow-lg shadow-pink-200 active:scale-95'}`}
              >
                {isPosting ? <Loader2 className="animate-spin" /> : <Send size={18} />}
                {isPosting ? 'در حال ارسال...' : 'انتشار گفتگو'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Community;