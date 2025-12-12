import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';


const CampaignStoryStep = ({ formData, updateFormData, errors }) => {
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [showTemplates, setShowTemplates] = useState(false);
  const [storyLength, setStoryLength] = useState(0);

  const storyTemplates = [
    {
      id: 'cancer',
      title: 'Cancer Treatment',
      template: `My name is [Patient Name], and I am [Age] years old. I have been diagnosed with [Specific Cancer Type] and need urgent medical treatment.\n\nThe diagnosis came as a shock to our family. The doctors have recommended [Treatment Plan] which includes [Surgery/Chemotherapy/Radiation details].\n\nThe total cost of treatment is estimated at [Amount] ADA, which includes:\n- Surgery and hospital stay\n- Chemotherapy/radiation sessions\n- Medications and follow-up care\n- Recovery and rehabilitation\n\nDespite having some insurance coverage, we are facing a significant financial gap. Your support would mean the world to us during this challenging time.\n\nI am determined to fight this battle and return to my normal life. With your help, I can focus on healing rather than worrying about medical bills.\n\nThank you for taking the time to read my story and for any support you can provide.`
    },
    {
      id: 'surgery',
      title: 'Emergency Surgery',
      template: `I am [Patient Name], [Age] years old, and I urgently need [Type of Surgery] due to [Medical Condition].\n\nThis medical emergency occurred [When/How it happened]. The doctors have explained that immediate surgery is necessary to [Reason for urgency].\n\nThe surgical procedure will involve [Surgery details] and is estimated to cost [Amount] ADA, covering:\n- Pre-operative tests and consultations\n- Surgical procedure and anesthesia\n- Hospital stay and intensive care\n- Post-operative medications and therapy\n\nOur family is doing everything we can, but the medical expenses are overwhelming. We are reaching out to our community for support during this critical time.\n\nEvery contribution, no matter the size, brings us closer to getting the life-saving treatment I need.\n\nThank you for your kindness and generosity.`
    },
    {
      id: 'chronic',
      title: 'Chronic Illness',
      template: `Hello, I am [Patient Name], and I have been living with [Chronic Condition] for [Duration]. At [Age] years old, I am seeking support for ongoing medical treatment.\n\nMy condition requires [Treatment description] which includes regular [Medications/Therapies/Procedures]. The monthly medical expenses have become a significant burden for our family.\n\nThe treatment plan includes:\n- Regular specialist consultations\n- Ongoing medications and therapies\n- Periodic medical tests and monitoring\n- Potential surgical interventions\n\nThe estimated cost for the next [Time period] is [Amount] ADA. While we have been managing so far, the cumulative expenses are becoming unsustainable.\n\nYour support would help ensure I can continue receiving the care I need to maintain my quality of life and health.\n\nI am grateful for any assistance you can provide.`
    }
  ];

  const handleTemplateSelect = (templateId) => {
    const template = storyTemplates?.find(t => t?.id === templateId);
    if (template) {
      updateFormData('campaignStory', template?.template);
      setSelectedTemplate(templateId);
      setShowTemplates(false);
      setStoryLength(template?.template?.length);
    }
  };

  const handleStoryChange = (value) => {
    updateFormData('campaignStory', value);
    setStoryLength(value?.length);
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e?.target?.files);
    const currentImages = formData?.campaignImages || [];

    files?.forEach(file => {
      // Mock image upload
      const mockImageUrl = `https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&h=600&fit=crop&crop=center`;
      const newImage = {
        id: Date.now() + Math.random(),
        url: mockImageUrl,
        name: file?.name,
        size: file?.size
      };
      currentImages?.push(newImage);
    });

    updateFormData('campaignImages', currentImages);
  };

  const removeImage = (imageId) => {
    const updatedImages = (formData?.campaignImages || [])?.filter(img => img?.id !== imageId);
    updateFormData('campaignImages', updatedImages);
  };

  return (
    <div className="space-y-6">
      <div className="bg-card border border-border rounded-medical p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">Campaign Story</h3>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowTemplates(!showTemplates)}
            iconName="FileText"
            iconPosition="left"
          >
            Use Template
          </Button>
        </div>

        {showTemplates && (
          <div className="mb-6 p-4 bg-muted rounded-medical">
            <h4 className="font-medium text-foreground mb-3">Choose a Template</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {storyTemplates?.map((template) => (
                <button
                  key={template?.id}
                  onClick={() => handleTemplateSelect(template?.id)}
                  className="p-3 text-left border border-border rounded-medical hover:border-primary hover:bg-primary/5 transition-colors duration-200"
                >
                  <div className="font-medium text-foreground">{template?.title}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Click to use this template
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-4">
          <Input
            label="Campaign Title"
            type="text"
            placeholder="Help [Patient Name] Fight [Medical Condition]"
            value={formData?.campaignTitle || ''}
            onChange={(e) => updateFormData('campaignTitle', e?.target?.value)}
            error={errors?.campaignTitle}
            required
            description="Create a compelling title that clearly describes your medical need"
          />

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Campaign Story <span className="text-error">*</span>
            </label>
            <textarea
              className="w-full min-h-[300px] p-3 border border-border rounded-medical focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-vertical"
              placeholder="Tell your story... Share your medical journey, treatment needs, and how donations will help. Be honest and specific about your situation."
              value={formData?.campaignStory || ''}
              onChange={(e) => handleStoryChange(e?.target?.value)}
              maxLength={5000}
            />
            <div className="flex items-center justify-between mt-2">
              <div className="text-sm text-muted-foreground">
                Share your personal story, medical journey, and specific treatment needs
              </div>
              <div className={`text-sm ${storyLength > 4500 ? 'text-warning' : 'text-muted-foreground'}`}>
                {storyLength}/5000 characters
              </div>
            </div>
            {errors?.campaignStory && (
              <p className="text-sm text-error mt-1">{errors?.campaignStory}</p>
            )}
          </div>
        </div>
      </div>
      <div className="bg-card border border-border rounded-medical p-6">
        <h4 className="font-medium text-foreground mb-4">Campaign Images</h4>

        <div className="space-y-4">
          <div className="border-2 border-dashed border-border rounded-medical p-6 text-center">
            <Icon name="Image" size={32} className="text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground mb-3">
              Add photos to help tell your story (Optional but recommended)
            </p>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              id="campaign-images"
            />
            <Button
              variant="outline"
              onClick={() => document.getElementById('campaign-images')?.click()}
              iconName="Upload"
              iconPosition="left"
            >
              Upload Images
            </Button>
            <p className="text-xs text-muted-foreground mt-2">
              JPG, PNG up to 5MB each. Maximum 5 images.
            </p>
          </div>

          {formData?.campaignImages && formData?.campaignImages?.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {formData?.campaignImages?.map((image) => (
                <div key={image?.id} className="relative group">
                  <img
                    src={image?.url}
                    alt={image?.name}
                    className="w-full h-32 object-cover rounded-medical border border-border"
                  />
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => removeImage(image?.id)}
                    className="absolute top-2 right-2 w-6 h-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-error hover:bg-error/90"
                    iconName="X"
                    iconSize={12}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="bg-card border border-border rounded-medical p-6">
        <h4 className="font-medium text-foreground mb-3">Story Writing Tips</h4>
        <div className="space-y-3 text-sm text-muted-foreground">
          <div className="flex items-start space-x-2">
            <Icon name="Heart" size={16} className="text-primary mt-0.5" />
            <p><strong>Be personal:</strong> Share your story in your own words. Authenticity builds trust with donors.</p>
          </div>
          <div className="flex items-start space-x-2">
            <Icon name="FileText" size={16} className="text-secondary mt-0.5" />
            <p><strong>Be specific:</strong> Include details about your diagnosis, treatment plan, and exact financial needs.</p>
          </div>
          <div className="flex items-start space-x-2">
            <Icon name="Users" size={16} className="text-accent mt-0.5" />
            <p><strong>Show impact:</strong> Explain how donations will directly help your medical treatment and recovery.</p>
          </div>
          <div className="flex items-start space-x-2">
            <Icon name="Camera" size={16} className="text-warning mt-0.5" />
            <p><strong>Add photos:</strong> Include respectful images that help donors connect with your story.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CampaignStoryStep;