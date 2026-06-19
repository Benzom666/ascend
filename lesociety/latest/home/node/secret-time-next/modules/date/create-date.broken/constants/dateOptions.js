const BrunchImg = "/assets/new-create-date/24b5b1c3-4a44-4649-89f8-47bbdb4fae91-7.jpg";
const EveningImg = "/assets/new-create-date/24b5b1c3-4a44-4649-89f8-47bbdb4fae91-8.jpg";
const SportyImg = "/assets/new-create-date/24b5b1c3-4a44-4649-89f8-47bbdb4fae91-9.jpg";
const ClassImg = "/assets/new-create-date/24b5b1c3-4a44-4649-89f8-47bbdb4fae91-10.jpg";
const WineImg = "/assets/new-create-date/24b5b1c3-4a44-4649-89f8-47bbdb4fae91-11.jpg";
const BottlesImg = "/assets/new-create-date/24b5b1c3-4a44-4649-89f8-47bbdb4fae91-12.jpg";
const EntertainmentImg = "/assets/new-create-date/24b5b1c3-4a44-4649-89f8-47bbdb4fae91-6.jpg";
import { CustomIcon } from "core/icon";

/**
 * Experience type options for date creation
 */
export const EXPERIENCE_TYPES = [
  {
    id: "MorningBeverage",
    label: "Brunch",
    description: "Perfect when you're free mornings to early afternoon.",
    category: "standard_class_date",
    badge: "Budget",
    image: BrunchImg,
    icon: <CustomIcon.Sun color={"#AFABAB"} size={20} />,
  },
  {
    id: "EveningDate",
    label: "Evening",
    description: "Perfect when you're free evenings and nights.",
    category: "standard_class_date",
    badge: "Budget",
    image: EveningImg,
    icon: <CustomIcon.Moon color={"#AFABAB"} size={20} />,
  },
  {
    id: "GetSporty",
    label: "Get Sporty",
    description:
      "Adventure dates with a playful twist—from mini-golf to kayaking. Perfect for those who crave a high-energy, unforgettable vibe.",
    category: "middle_class_dates",
    badge: "Mid",
    image: SportyImg,
    icon: <CustomIcon.Sporty color={"#AFABAB"} size={20} />,
  },
  {
    id: "TakeClass",
    label: "Take A Class",
    description:
      "Fun classes or activities: gym, pilates, painting, pottery, or any creative moment.",
    category: "middle_class_dates",
    badge: "Mid",
    image: ClassImg,
    icon: <CustomIcon.TakeClass color={"#AFABAB"} size={20} />,
  },
  {
    id: "WineDine",
    label: "Wine & Dine",
    description:
      "Make the most of the night with upscale dining and conversation.",
    category: "middle_class_dates",
    badge: "Lux",
    image: WineImg,
    icon: <CustomIcon.WineDine color={"#AFABAB"} size={20} />,
  },
  {
    id: "BottlesDance",
    label: "Bottles & Dance",
    description: "Make the most of the night with a night out—VIP style.",
    category: "executive_class_dates",
    badge: "Lux",
    image: BottlesImg,
    icon: <CustomIcon.BottlesDance color={"#AFABAB"} size={20} />,
  },
  {
    id: "Entertainmentsports",
    label: "Entertainment & Sports",
    description:
      "Live concerts, Broadway shows, or a memorable night out.",
    category: "middle_class_dates",
    badge: "Mid",
    image: EntertainmentImg,
    icon: <CustomIcon.EntertainmentSports color={"#AFABAB"} size={20} />,
  },
];

/**
 * Grouped experiences for UI display
 */
export const EXPERIENCE_GROUPS = [
  {
    title: "Flex on time?",
    options: [
      EXPERIENCE_TYPES[0], // Brunch
      EXPERIENCE_TYPES[1], // Evening
    ],
  },
  {
    title: "Crave a vibe?",
    options: [
      EXPERIENCE_TYPES[2], // Get Sporty
      EXPERIENCE_TYPES[3], // Take A Class
    ],
  },
  {
    title: "A night out?",
    options: [
      EXPERIENCE_TYPES[4], // Wine & Dine
      EXPERIENCE_TYPES[5], // Bottles & Dance
    ],
  },
  {
    title: "",
    options: [
      EXPERIENCE_TYPES[6], // Entertainment & Sports
    ],
  },
];

/**
 * Price options for dates
 */
export const PRICE_OPTIONS = [80, 100, 150, 200, 300, 400, 500, 750, 1000];

/**
 * Duration options for dates
 */
export const DURATION_OPTIONS = [
  {
    id: "1-2_hours",
    label: "1-2 hours",
    value: "1-2 hours",
    description: "A quick drink or coffee.",
  },
  {
    id: "2-3_hours",
    label: "2-3 hours",
    value: "2-3 hours",
    description: "Dinner and a relaxed evening.",
  },
  {
    id: "3-4_hours",
    label: "3-4 hours",
    value: "3-4 hours",
    description: "Dinner + drinks or a show.",
  },
  {
    id: "4plus_hours",
    label: "Full evening (4+ hours)",
    value: "Full evening (4+ hours)",
    description: "Let the night unfold beautifully.",
  },
  {
    id: "flexible",
    label: "Flexible – lets see where it take us",
    value: "Flexible – lets see where it take us",
    description: "",
  },
];

/**
 * Default form values
 */
export const DEFAULT_FORM_VALUES = {
  search_type: null, // Experience type object
  enter__category: "", // Category ID
  enter__aspiration: "", // Aspiration ID
  education: "", // Price
  date_duration: "", // Duration
  date_description: "", // Description
  image_index: 0, // Selected image index
  dateId: null, // Date ID (for editing)
};

/**
 * Validation constants
 */
export const VALIDATION_RULES = {
  DESCRIPTION_MIN_LENGTH: 50,
  DESCRIPTION_MAX_LENGTH: 500,
};

/**
 * Step titles for progress indicator
 */
export const STEP_TITLES = [
  "Experience",
  "Category & Price",
  "Duration",
  "Description",
  "Preview",
];

/**
 * Form step keys
 */
export const FORM_STEPS = {
  EXPERIENCE: 0,
  CATEGORY_PRICE: 1,
  DURATION: 2,
  DESCRIPTION: 3,
  PREVIEW: 4,
};
