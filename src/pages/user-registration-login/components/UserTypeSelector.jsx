import React from 'react';
import Icon from '../../../components/AppIcon';

const UserTypeSelector = ({ selectedType, onTypeChange, error }) => {
  const userTypes = [
    {
      id: 'patient',
      label: 'Patient',
      description: 'Create medical fundraising campaigns',
      icon: 'Heart',
      color: 'text-primary'
    },
    {
      id: 'donor',
      label: 'Donor',
      description: 'Support medical campaigns',
      icon: 'HandHeart',
      color: 'text-secondary'
    },
    {
      id: 'hospital',
      label: 'Hospital Verifier',
      description: 'Verify medical campaigns',
      icon: 'Shield',
      color: 'text-accent'
    }
  ];

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-foreground">
        I am a <span className="text-error">*</span>
      </label>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {userTypes?.map((type) => (
          <button
            key={type?.id}
            type="button"
            onClick={() => onTypeChange(type?.id)}
            className={`p-4 border-2 rounded-medical text-left transition-all duration-200 hover:shadow-medical-sm ${
              selectedType === type?.id
                ? 'border-primary bg-primary/5 shadow-medical-sm'
                : 'border-border hover:border-muted-foreground'
            }`}
          >
            <div className="flex items-center space-x-3">
              <Icon 
                name={type?.icon} 
                size={20} 
                className={selectedType === type?.id ? 'text-primary' : type?.color}
              />
              <div className="flex-1 min-w-0">
                <div className={`font-medium text-sm ${
                  selectedType === type?.id ? 'text-primary' : 'text-foreground'
                }`}>
                  {type?.label}
                </div>
                <div className="text-xs text-muted-foreground mt-0.5 truncate">
                  {type?.description}
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>
      {error && (
        <p className="text-sm text-error mt-1">{error}</p>
      )}
    </div>
  );
};

export default UserTypeSelector;