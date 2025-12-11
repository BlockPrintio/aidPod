import React from 'react';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';

const SocialAuthOptions = ({ onSocialAuth, isLoading }) => {
  const socialProviders = [
    {
      id: 'google',
      name: 'Google',
      icon: 'Chrome',
      color: 'hover:bg-red-50 hover:border-red-200'
    },
    {
      id: 'facebook',
      name: 'Facebook',
      icon: 'Facebook',
      color: 'hover:bg-blue-50 hover:border-blue-200'
    },
    {
      id: 'apple',
      name: 'Apple',
      icon: 'Apple',
      color: 'hover:bg-gray-50 hover:border-gray-200'
    }
  ];

  return (
    <div className="space-y-4">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-background text-muted-foreground">Or continue with</span>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {socialProviders?.map((provider) => (
          <Button
            key={provider?.id}
            variant="outline"
            onClick={() => onSocialAuth(provider?.id)}
            loading={isLoading}
            className={`transition-all duration-200 ${provider?.color}`}
          >
            <Icon name={provider?.icon} size={18} className="mr-2" />
            {provider?.name}
          </Button>
        ))}
      </div>
      <div className="text-center">
        <p className="text-xs text-muted-foreground">
          By signing up, you agree to our{' '}
          <a href="/terms" className="text-primary hover:text-primary/80 transition-colors duration-200">
            Terms of Service
          </a>{' '}
          and{' '}
          <a href="/privacy" className="text-primary hover:text-primary/80 transition-colors duration-200">
            Privacy Policy
          </a>
        </p>
      </div>
    </div>
  );
};

export default SocialAuthOptions;