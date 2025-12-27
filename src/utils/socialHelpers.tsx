import { Twitter, Instagram, Globe, Youtube, User } from 'lucide-react';

export const getSocialIcon = (input: string) => {
  const lower = input.toLowerCase();
  
  if (lower.includes('twitter') || lower.includes('x.com')) return <Twitter className="w-3 h-3 text-blue-400" />;
  if (lower.includes('instagram')) return <Instagram className="w-3 h-3 text-pink-500" />;
  if (lower.includes('youtube')) return <Youtube className="w-3 h-3 text-red-500" />;
  // Default to User icon if it's just a name or random handle
  return <User className="w-3 h-3 text-gray-400" />;
};

export const formatHandle = (name: string) => {
  if (!name) return "Anonymous";
  // If they typed "twitter.com/mike", just show "@mike"
  if (name.includes('/')) {
    const parts = name.split('/');
    return `@${parts[parts.length - 1]}`;
  }
  // If they typed "Mike", make it "@Mike"
  return name.startsWith('@') ? name : `@${name}`;
};