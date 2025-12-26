import { ChartDataPoint, DailyTip, ForumPost, UserProfile } from "./types";

export const MRS_QUESTIONS = [
  { id: 1, text: "گرگرفتگی و تعریق", category: "somatic" },
  { id: 2, text: "ناراحتی قلبی (تپش قلب)", category: "somatic" },
  { id: 3, text: "مشکلات خواب", category: "somatic" },
  { id: 4, text: "حالت افسردگی", category: "psychological" },
  { id: 5, text: "تحریک‌پذیری و عصبی بودن", category: "psychological" },
  { id: 6, text: "اضطراب و نگرانی", category: "psychological" },
  { id: 7, text: "خستگی جسمی و ذهنی", category: "psychological" },
  { id: 8, text: "مشکلات جنسی", category: "urogenital" },
  { id: 9, text: "مشکلات ادراری", category: "urogenital" },
  { id: 10, text: "خشکی واژن", category: "urogenital" },
  { id: 11, text: "درد مفاصل و عضلات", category: "somatic" },
];

export const FORUM_TOPICS = [
  "گرگرفتگی", "خلق‌وخو", "خواب", "ورزش", "پوست و مو", "روابط زناشویی"
];

export const COMMON_SYMPTOMS = [
  "گرگرفتگی", "تعریق شبانه", "بی‌خوابی", "خشکی واژن", 
  "تپش قلب", "اضطراب", "خستگی", "درد مفاصل", "کاهش تمرکز", "ریزش مو", "افزایش وزن", "سردرد"
];

export const MOCK_USER: UserProfile = {
  name: "کاربر جدید",
  age: 0,
  weight: 0,
  periodStatus: "نامنظم",
  dominantSymptoms: [],
  role: 'user'
};

// داده‌های خالی برای شروع (خط صاف در نمودار)
export const EMPTY_CHART_DATA: ChartDataPoint[] = [
  { name: "هفته ۱", total: 0, somatic: 0, psychological: 0, urogenital: 0 },
  { name: "هفته ۲", total: 0, somatic: 0, psychological: 0, urogenital: 0 },
  { name: "هفته ۳", total: 0, somatic: 0, psychological: 0, urogenital: 0 },
  { name: "هفته ۴", total: 0, somatic: 0, psychological: 0, urogenital: 0 },
];

// برای سازگاری کد فعلی
export const MOCK_CHART_DATA = EMPTY_CHART_DATA;

// Empty array to ensure only real posts are shown
export const MOCK_POSTS: ForumPost[] = [];

export const DAILY_TIPS: DailyTip[] = [
  { type: 'health', title: 'نکته سلامتی', content: 'امروز یک لیوان آب بیشتر بنوشید تا هیدراته بمانید.' },
  { type: 'motivational', title: 'سخن روز', content: 'این فصل از زندگی شما، شروعی برای خودشناسی عمیق‌تر است.' },
  { type: 'health', title: 'تغذیه', content: 'مصرف کلسیم و ویتامین D را فراموش نکنید.' },
];