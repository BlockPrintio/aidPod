import React from 'react';
import Icon from '../../../components/AppIcon';

const StepIndicator = ({ currentStep, totalSteps, steps }) => {
  return (
    <div className="w-full bg-card border border-border rounded-medical p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-foreground">Create Campaign</h2>
        <span className="text-sm text-muted-foreground">
          Step {currentStep} of {totalSteps}
        </span>
      </div>
      <div className="flex items-center space-x-2">
        {steps?.map((step, index) => (
          <React.Fragment key={step?.id}>
            <div className="flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-200 ${
                  index + 1 < currentStep
                    ? 'bg-success border-success text-white'
                    : index + 1 === currentStep
                    ? 'bg-primary border-primary text-white' :'bg-muted border-border text-muted-foreground'
                }`}
              >
                {index + 1 < currentStep ? (
                  <Icon name="Check" size={16} />
                ) : (
                  <span className="text-sm font-medium">{index + 1}</span>
                )}
              </div>
              <span className={`text-xs mt-2 text-center max-w-20 ${
                index + 1 === currentStep ? 'text-primary font-medium' : 'text-muted-foreground'
              }`}>
                {step?.title}
              </span>
            </div>
            {index < steps?.length - 1 && (
              <div className={`flex-1 h-0.5 mx-2 ${
                index + 1 < currentStep ? 'bg-success' : 'bg-border'
              }`}></div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default StepIndicator;