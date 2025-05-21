import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { 
  CodeBracketIcon,
  UserGroupIcon,
  ChatBubbleBottomCenterTextIcon,
  CommandLineIcon,
  PuzzlePieceIcon,
  AcademicCapIcon,
  EnvelopeIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import { 
  StarIcon,
  CheckCircleIcon 
} from '@heroicons/react/24/solid';
import ThreeDScene from '../components/ThreeDScene.jsx';

const Home = () => {
  const { t, i18n } = useTranslation();
  const [formData, setFormData] = useState({ 
    name: '', 
    email: '', 
    message: '' 
  });
  
  const [formState, setFormState] = useState({
    submitting: false,
    submitted: false,
  });

  // Animation Settings
  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2, delayChildren: 0.3 }
    }
  };

  // Dummy Data
  const teachers = [
    { 
      name: t('teachers.ahmed.name'), 
      expertise: t('teachers.ahmed.expertise'), 
      exp: t('teachers.ahmed.exp'), 
      image: "https://as1.ftcdn.net/v2/jpg/03/81/38/78/1000_F_381387894_rtSaD0i9GRwm4IcHEiLKtXDlwOF2zhsh.jpg" 
    },
    { 
      name: t('teachers.noura.name'), 
      expertise: t('teachers.noura.expertise'), 
      exp: t('teachers.noura.exp'), 
      image: "https://as1.ftcdn.net/v2/jpg/01/71/56/62/1000_F_171566206_IQVOkdKX4zDZiF4KCcgg4Zw1Gvycklcs.jpg" 
    },
    { 
      name: t('teachers.omar.name'), 
      expertise: t('teachers.omar.expertise'), 
      exp: t('teachers.omar.exp'), 
      image: "https://as1.ftcdn.net/v2/jpg/01/04/93/90/1000_F_104939054_E7P5jaVoNYcXQI7YBrzsVWH2qZc03sn8.jpg" 
    },
  ];

  const reviews = [
    {
      name: t('reviews.sarah.name'),
      age: 12,
      text: t('reviews.sarah.text'),
      image: "https://as2.ftcdn.net/v2/jpg/05/29/12/57/1000_F_529125762_omW1yTehDLLFJKwLJjRET0G3sXiQnK5g.jpg"
    },
    {
      name: t('reviews.mike.name'),
      age: 10,
      text: t('reviews.mike.text'),
      image: "https://as1.ftcdn.net/v2/jpg/05/86/53/10/1000_F_586531028_Al6pWYEhlc9w8zUA9yu2vw2DS0o45Q0D.jpg"
    },
    {
      name: t('reviews.emma.name'),
      age: 11,
      text: t('reviews.emma.text'),
      image: "https://as1.ftcdn.net/v2/jpg/05/92/22/28/1000_F_592222897_VahacwkiNKhQ3bXkstliYEckwQXuOpF1.jpg"
    }
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;
    
    setFormState({ submitting: true, submitted: false });

    setTimeout(() => {
      setFormState({ submitting: false, submitted: true });
      setFormData({ name: '', email: '', message: '' });
    }, 1500);
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    document.documentElement.dir = lng === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lng;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-[#C7E2FC] text-blue-800 relative overflow-hidden" dir={i18n.dir()}>
      {/* الخلفية المزخرفة باللون الأزرق الفاتح */}
      <motion.div 
        className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAzNGM0LjQxOCAwIDgtMy41ODIgOC04cy0zLjU4Mi04LTgtOC04IDMuNTgyLTggOCAzLjU4MiA4IDggOHoiIHN0cm9rZT0iI0M3RTJGQyIgc3Ryb2tlLW9wYWNpdHk9Ii4wMyIvPjwvZz48L3N2Zz4=')] opacity-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.1 }}
        transition={{ duration: 1.5 }}
      />

      {/* Navigation Bar */}
      <motion.nav 
        className="bg-white/90 backdrop-blur-md shadow-md sticky top-0 z-50 border-b border-blue-200"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 100 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5 }}
              className="flex items-center"
            >
              <SparklesIcon className="h-10 w-10 text-blue-600 animate-pulse" />
              <span className="ml-3 text-2xl font-bold text-blue-800 font-['Poppins']">
                {t('appName')}
              </span>
            </motion.div>
            
            <div className="hidden lg:flex space-x-8">
              {[
                { name: t('nav.features'), id: "#features", icon: <CodeBracketIcon className="h-5 w-5" /> },
                { name: t('nav.teachers'), id: "#teachers", icon: <UserGroupIcon className="h-5 w-5" /> },
                { name: t('nav.reviews'), id: "#reviews", icon: <ChatBubbleBottomCenterTextIcon className="h-5 w-5" /> },
                { name: t('nav.contact'), id: "#contact", icon: <EnvelopeIcon className="h-5 w-5" /> },
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className="flex items-center group"
                >
                  {item.icon}
                  <a
                    href={item.id}
                    className="px-3 py-2 text-blue-700 hover:text-blue-500 font-medium transition-all flex items-center gap-2"
                  >
                    <span className="group-hover:underline decoration-2">{item.name}</span>
                  </a>
                </motion.div>
              ))}
            </div>

            <div className="flex items-center gap-4">
              <motion.button
                onClick={() => changeLanguage('en')}
                className={`px-3 py-1 rounded-md ${i18n.language === 'en' ? 'bg-blue-100 text-blue-700' : 'text-blue-500'}`}
                whileHover={{ scale: 1.05 }}
              >
                English
              </motion.button>
              <motion.button
                onClick={() => changeLanguage('ar')}
                className={`px-3 py-1 rounded-md ${i18n.language === 'ar' ? 'bg-blue-100 text-blue-700' : 'text-blue-500'}`}
                whileHover={{ scale: 1.05 }}
              >
                العربية
              </motion.button>
              
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
              >
                <Link 
                  to="/login"
                  className="px-6 py-3 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-medium hover:from-blue-700 hover:to-cyan-600 transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                >
                  {t('getStarted')}
                </Link>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Hero Section */}
        <div className="flex flex-col-reverse lg:flex-row items-center justify-between gap-12 relative z-10">
          <motion.div 
            className="text-center lg:text-left flex-1"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <motion.h1 
              className="text-5xl md:text-6xl font-extrabold mb-6 font-['Poppins']"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <motion.span 
                className="text-blue-700 block"
                initial={{ y: 30 }}
                animate={{ y: 0 }}
              >
                {t('hero.title1')}
              </motion.span>
              <motion.span
                className="text-cyan-500 block mt-4"
                initial={{ y: 30 }}
                animate={{ y: 0 }}
                transition={{ delay: 0.2 }}
              >
                {t('hero.title2')}
              </motion.span>
            </motion.h1>

            <motion.p 
              className="text-lg md:text-xl text-blue-600 max-w-xl mx-auto lg:mx-0 mb-8 font-['Comic_Neue'] leading-relaxed"
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
            >
              {t('hero.subtitle')}
            </motion.p>

            <motion.div
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.6 }}
            >
               <Link 
                to="/login" 
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold rounded-full text-lg hover:from-blue-700 hover:to-cyan-600 transition-all duration-300 shadow-xl hover:shadow-2xl hover:-translate-y-1 flex items-center group"
              >
                {t('startJourney')}
                <CommandLineIcon className="h-5 w-5 ml-2 group-hover:rotate-45 transition-transform" />
              </Link>
            </motion.div>
          </motion.div>

          <motion.div
            className="flex-1 w-full max-w-4xl h-[800px] mx-auto relative z-20 rounded-2xl overflow-hidden shadow-2xl"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ 
              type: 'spring',
              stiffness: 100,
              damping: 15,
              delay: 0.4
            }}
          >
            <ThreeDScene />
          </motion.div>
        </div>

        {/* Features Section */}
        <section id="features" className="mt-32">
          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-3"
          >
            {[ 
              {
                icon: <PuzzlePieceIcon className="h-14 w-14 text-blue-600" />,
                title: t('features.interactive.title'),
                description: t('features.interactive.description')
              },
              {
                icon: <AcademicCapIcon className="h-14 w-14 text-blue-600" />,
                title: t('features.experts.title'),
                description: t('features.experts.description')
              },
              {
                icon: <SparklesIcon className="h-14 w-14 text-blue-600" />,
                title: t('features.fun.title'),
                description: t('features.fun.description')
              }
            ].map((feature, index) => (
              <motion.div 
                key={index}
                variants={fadeInUp}
                whileHover={{ y: -10 }}
                className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform border border-blue-100"
              >
                <div className="flex justify-center mb-6">
                  <motion.div 
                    className="p-4 bg-blue-50 rounded-full shadow-inner"
                    whileHover={{ rotate: 15, scale: 1.1 }}
                  >
                    {feature.icon}
                  </motion.div>
                </div>
                <h3 className="text-2xl font-bold text-center text-blue-800 mb-4 font-['Poppins']">{feature.title}</h3>
                <p className="text-blue-600 text-center font-['Comic_Neue'] leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* Teachers Section */}
        <section id="teachers" className="mt-32">
          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="text-center"
          >
            <motion.h2 
              variants={fadeInUp}
              className="text-3xl font-bold text-blue-800 mb-12"
            >
              {t('teachersSection.title')}
            </motion.h2>
            
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-3 gap-8"
              variants={staggerContainer}
            >
              {teachers.map((teacher, index) => (
                <motion.div
                  key={index}
                  variants={fadeInUp}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow"
                >
                  <motion.div
                    className="h-48 w-48 mx-auto mb-4 rounded-full overflow-hidden border-4 border-blue-100"
                    whileHover={{ scale: 1.05 }}
                  >
                    <img 
                      src={teacher.image} 
                      alt={teacher.name} 
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </motion.div>
                  <h3 className="text-xl font-bold text-blue-800">{teacher.name}</h3>
                  <p className="text-blue-600 mt-2">{teacher.expertise}</p>
                  <div className="mt-4 bg-blue-100 px-4 py-2 rounded-full text-sm">
                    {teacher.exp} {t('experience')}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </section>

        {/* Reviews Section */}
        <section id="reviews" className="mt-32">
          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-center"
          >
            <motion.h2 
              variants={fadeInUp}
              className="text-3xl font-bold text-blue-800 mb-12"
            >
              {t('reviewsSection.title')}
            </motion.h2>
            
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-3 gap-8"
              variants={staggerContainer}
            >
              {reviews.map((review, index) => (
                <motion.div
                  key={index}
                  variants={fadeInUp}
                  whileHover={{ rotate: 1, y: -5 }}
                  className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all"
                >
                  <div className="h-32 w-32 mx-auto mb-4 rounded-full overflow-hidden border-4 border-blue-100">
                    <img 
                      src={review.image} 
                      alt={review.name} 
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                  <h3 className="text-xl font-bold text-blue-800">{review.name}</h3>
                  <p className="text-blue-500 text-sm mb-4">{t('age')} {review.age}</p>
                  <p className="text-blue-600 italic">"{review.text}"</p>
                  <div className="mt-4 flex justify-center space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <StarIcon
                        key={i}
                        className="h-5 w-5 text-yellow-400 inline"
                        aria-hidden="true"
                      />
                    ))}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </section>

        {/* Contact Section */}
        <section id="contact" className="mt-32">
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="bg-blue-50 rounded-2xl p-8 shadow-inner"
          >
          <motion.h2 
              variants={fadeInUp}
              className="text-3xl font-bold text-blue-800 mb-12"
            >
              {t('contact.title')}
          </motion.h2>
            <div className="max-w-2xl mx-auto text-center">
              {formState.submitted ? (
                <motion.div
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 100 }}
                  className="bg-green-50 p-8 rounded-xl"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="flex flex-col items-center"
                  >
                    <CheckCircleIcon className="h-20 w-20 text-green-600 mb-4" />
                    <h3 className="text-2xl font-bold text-green-700 mb-2">
                      {t('contact.successTitle')} 🎉
                    </h3>
                    <p className="text-green-600">
                      {t('contact.successMessage')}
                    </p>
                  </motion.div>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <input 
                      type="text"
                      name="name"
                      placeholder={t('contact.form.name')}
                      className="p-3 rounded-lg border border-blue-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                    />
                    <input 
                      type="email"
                      name="email"
                      placeholder={t('contact.form.email')}
                      className="p-3 rounded-lg border border-blue-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <textarea 
                    rows="4"
                    name="message"
                    placeholder={t('contact.form.message')}
                    className="w-full p-3 rounded-lg border border-blue-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                  ></textarea>
                  <motion.button
                    whileHover={!formState.submitting ? { scale: 1.05 } : {}}
                    whileTap={!formState.submitting ? { scale: 0.95 } : {}}
                    className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors relative"
                    type="submit"
                    disabled={formState.submitting}
                  >
                    {formState.submitting ? (
                      <div className="flex items-center justify-center">
                        <svg className="animate-spin h-5 w-5 mr-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        {t('contact.sending')}
                      </div>
                    ) : (
                      t('contact.sendButton')
                    )}
                  </motion.button>
                </form>
              )}
            </div>
          </motion.div>
        </section>
      </main>

      {/* Footer */}
      <motion.footer 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="bg-white/90 backdrop-blur-md py-8 mt-16 border-t border-blue-200"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-blue-600 font-['Comic_Neue']">
            © {new Date().getFullYear()} {t('appName')}. {t('footer.rights')}
          </p>
        </div>
      </motion.footer>
    </div>
  );
};

export default Home;