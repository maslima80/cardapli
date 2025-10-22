// Wizard state types for catalog creation

export type WizardMode = 'products' | 'categories' | 'tags';

export interface WizardAutoSections {
  about?: boolean;
  socials?: boolean;
  location?: boolean;
  how_to_buy?: boolean;
  delivery?: boolean;
  pickup?: boolean;
  shipping?: boolean;
  payment?: boolean;
  testimonials?: boolean;
  guarantee?: boolean;
}

export interface WizardState {
  // Step 1: Mode selection
  mode: WizardMode;
  
  // Step 2: Content selection
  selectedIds: string[]; // product IDs OR category names OR tag names
  allProducts?: any[]; // For categories/tags mode
  
  // Step 3: Cover & Layout
  title: string;
  description: string;
  coverImage: string;
  coverImages?: string[]; // For carousel
  coverLayout: 'logo-title-image' | 'image-top' | 'carousel-top' | 'full-background';
  showLogo: boolean;
  productLayout: 'grid' | 'list' | 'grid_cinematic';
  
  // Step 4: Auto sections (NEW)
  autoSections: WizardAutoSections;
  
  // Current step
  currentStep: number;
}

export const defaultWizardState: Partial<WizardState> = {
  currentStep: 3, // Start at step 3 (cover & layout) since 1-2 are done
  autoSections: {
    about: false,
    socials: false,
    location: false,
    how_to_buy: false,
    delivery: false,
    pickup: false,
    shipping: false,
    payment: false,
    testimonials: false,
    guarantee: false,
  },
};
