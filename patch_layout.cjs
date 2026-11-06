const fs = require('fs');
let code = fs.readFileSync('src/components/layout/MainLayout.tsx', 'utf8');

if (!code.includes('{ name: "Super Admin", path: "/admin", icon: Settings }')) {
  code = code.replace(
    'import { \n  Search, Bell, MessageSquare, Home, Users, ShoppingBag, \n  Calendar, Building2, Utensils, User, Star, BookOpen, Video, MoreHorizontal, ChevronDown, MapPin, Heart, UserPlus\n} from "lucide-react";',
    'import { \n  Search, Bell, MessageSquare, Home, Users, ShoppingBag, \n  Calendar, Building2, Utensils, User, Star, BookOpen, Video, MoreHorizontal, ChevronDown, MapPin, Heart, UserPlus, Settings\n} from "lucide-react";'
  );

  code = code.replace(
    '{ name: "Videos", path: "/videos", icon: Video },',
    '{ name: "Videos", path: "/videos", icon: Video },\n  { name: "Super Admin", path: "/admin", icon: Settings },'
  );

  fs.writeFileSync('src/components/layout/MainLayout.tsx', code);
}
