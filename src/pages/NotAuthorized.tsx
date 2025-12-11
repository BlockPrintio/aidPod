import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/ui/Header';
import Button from '../components/ui/Button';
import Icon from '../components/AppIcon';

const NotAuthorized: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header isAuthenticated={false} />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <div className="mx-auto w-16 h-16 rounded-full bg-error/10 flex items-center justify-center mb-6">
          <Icon name="Shield" size={28} className="text-error" />
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-3">Access denied</h1>
        <p className="text-muted-foreground mb-8">
          You don't have permission to view this page with your current role.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link to="/">
            <Button variant="outline">Go Home</Button>
          </Link>
          <Link to="/user-registration-login">
            <Button>Switch Account</Button>
          </Link>
        </div>
      </main>
    </div>
  );
};

export default NotAuthorized;

