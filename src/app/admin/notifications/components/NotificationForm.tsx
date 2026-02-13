'use client';

import { useState } from 'react';

type NotificationType = 'general' | 'alert' | 'course' | 'payment';
type DeliveryType = 'now' | 'scheduled';

export default function NotificationForm() {
  const [selectedType, setSelectedType] = useState<NotificationType>('general');
  const [deliveryType, setDeliveryType] = useState<DeliveryType>('now');
  const [showYouTubeInput, setShowYouTubeInput] = useState(false);

  const notificationTypes = [
    { id: 'general', icon: 'fas fa-info-circle', label: 'General' },
    { id: 'alert', icon: 'fas fa-exclamation-triangle', label: 'Alert' },
    { id: 'course', icon: 'fas fa-graduation-cap', label: 'Course' },
    { id: 'payment', icon: 'fas fa-credit-card', label: 'Payment' }
  ];

  const mediaTypes = [
    { id: 'image', icon: 'fas fa-image', label: 'Images' },
    { id: 'file', icon: 'fas fa-file', label: 'Files' },
    { id: 'video', icon: 'fas fa-video', label: 'Videos' },
    { id: 'youtube', icon: 'fab fa-youtube', label: 'YouTube', iconColor: 'text-red-500' }
  ];

  const handleMediaClick = (type: string) => {
    if (type === 'youtube') {
      setShowYouTubeInput(!showYouTubeInput);
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-6">Create New Notification</h3>
      
      {/* Notification Type */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Notification Type</label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {notificationTypes.map((type) => (
            <button
              key={type.id}
              onClick={() => setSelectedType(type.id as NotificationType)}
              className={`p-3 border-2 rounded-lg transition-colors ${
                selectedType === type.id
                  ? 'text-white'
                  : 'border-gray-300 text-gray-600'
              }`}
              style={{
                borderColor: selectedType === type.id ? 'var(--azul-ultramar)' : undefined,
                backgroundColor: selectedType === type.id ? 'var(--azul-ultramar)' : undefined
              }}
              onMouseEnter={(e) => {
                if (selectedType !== type.id) {
                  e.currentTarget.style.borderColor = 'var(--azul-ultramar)';
                }
              }}
              onMouseLeave={(e) => {
                if (selectedType !== type.id) {
                  e.currentTarget.style.borderColor = '';
                }
              }}
            >
              <i className={`${type.icon} mb-2`}></i>
              <div className="text-sm">{type.label}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Message Content */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
        <input 
          type="text" 
          className="w-full px-3 py-2 border border-gray-300 rounded-md" 
          style={{
            '--tw-ring-color': 'var(--azul-ultramar)',
            '--tw-border-opacity': '1'
          } as React.CSSProperties}
          onFocus={(e) => {
            e.target.style.borderColor = 'var(--azul-ultramar)';
            e.target.style.boxShadow = '0 0 0 3px rgba(59, 75, 177, 0.1)';
          }}
          onBlur={(e) => {
            e.target.style.borderColor = '';
            e.target.style.boxShadow = '';
          }}
          placeholder="Enter notification title"
        />
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
        <textarea 
          rows={4} 
          className="w-full px-3 py-2 border border-gray-300 rounded-md" 
          onFocus={(e) => {
            e.target.style.borderColor = 'var(--azul-ultramar)';
            e.target.style.boxShadow = '0 0 0 3px rgba(59, 75, 177, 0.1)';
          }}
          onBlur={(e) => {
            e.target.style.borderColor = '';
            e.target.style.boxShadow = '';
          }}
          placeholder="Enter your message here..."
        ></textarea>
      </div>

      {/* Media Attachments */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Attachments</label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          {mediaTypes.map((media) => (
            <button
              key={media.id}
              onClick={() => handleMediaClick(media.id)}
              className="p-4 border-2 border-dashed border-gray-300 rounded-lg transition-colors"
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--azul-ultramar)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '';
              }}
            >
              <i className={`${media.icon} text-2xl ${media.iconColor || 'text-gray-400'} mb-2`}></i>
              <div className="text-sm text-gray-600">{media.label}</div>
            </button>
          ))}
        </div>
        
        {/* YouTube URL Input */}
        {showYouTubeInput && (
          <div className="mb-4">
            <input 
              type="url" 
              className="w-full px-3 py-2 border border-gray-300 rounded-md" 
              onFocus={(e) => {
                e.target.style.borderColor = 'var(--azul-ultramar)';
                e.target.style.boxShadow = '0 0 0 3px rgba(59, 75, 177, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '';
                e.target.style.boxShadow = '';
              }}
              placeholder="Enter YouTube URL"
            />
          </div>
        )}
        
        {/* File Upload Area */}
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <i className="fas fa-cloud-upload-alt text-3xl text-gray-400 mb-2"></i>
          <p className="text-gray-600">Drag and drop files here, or <button className="hover:underline" style={{ color: 'var(--azul-ultramar)' }}>browse</button></p>
          <p className="text-sm text-gray-500 mt-1">Support for images, documents, videos (max 10MB)</p>
        </div>
      </div>

      {/* Schedule Options */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Delivery Options</label>
        <div className="space-y-3">
          <label className="flex items-center">
            <input 
              type="radio" 
              name="delivery" 
              value="now" 
              checked={deliveryType === 'now'}
              onChange={(e) => setDeliveryType(e.target.value as DeliveryType)}
              className="focus:ring-2"
              style={{
                accentColor: 'var(--azul-ultramar)',
                '--tw-ring-color': 'var(--azul-ultramar)'
              } as React.CSSProperties} 
            />
            <span className="ml-2 text-sm text-gray-700">Send immediately</span>
          </label>
          <label className="flex items-center">
            <input 
              type="radio" 
              name="delivery" 
              value="scheduled" 
              checked={deliveryType === 'scheduled'}
              onChange={(e) => setDeliveryType(e.target.value as DeliveryType)}
              className="focus:ring-2"
              style={{
                accentColor: 'var(--azul-ultramar)',
                '--tw-ring-color': 'var(--azul-ultramar)'
              } as React.CSSProperties}
            />
            <span className="ml-2 text-sm text-gray-700">Schedule for later</span>
          </label>
        </div>
        {deliveryType === 'scheduled' && (
          <div className="mt-3 grid grid-cols-2 gap-3">
            <input 
              type="date" 
              className="px-3 py-2 border border-gray-300 rounded-md"
              onFocus={(e) => {
                e.target.style.borderColor = 'var(--azul-ultramar)';
                e.target.style.boxShadow = '0 0 0 3px rgba(59, 75, 177, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '';
                e.target.style.boxShadow = '';
              }}
            />
            <input 
              type="time" 
              className="px-3 py-2 border border-gray-300 rounded-md"
              onFocus={(e) => {
                e.target.style.borderColor = 'var(--azul-ultramar)';
                e.target.style.boxShadow = '0 0 0 3px rgba(59, 75, 177, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '';
                e.target.style.boxShadow = '';
              }}
            />
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-4">
        <button 
          className="text-white px-6 py-2 rounded-md transition-colors"
          style={{ backgroundColor: 'var(--azul-ultramar)' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#2563eb';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--azul-ultramar)';
          }}
        >
          <i className="fas fa-paper-plane mr-2"></i>
          Send Notification
        </button>
        <button 
          className="text-white px-6 py-2 rounded-md transition-colors"
          style={{ backgroundColor: 'var(--amarillo-ocre)' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#d97706';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--amarillo-ocre)';
          }}
        >
          <i className="fas fa-save mr-2"></i>
          Save Draft
        </button>
        <button className="bg-gray-300 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-400 transition-colors">
          <i className="fas fa-eye mr-2"></i>
          Preview
        </button>
      </div>
    </div>
  );
}