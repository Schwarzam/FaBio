

import React, {useEffect} from "react";
import { AuroraBackground } from "./ui/aurora";
import { motion } from "framer-motion";

import { useNavigate } from "react-router-dom";

function Home() {

  const [isDark, setIsDark] = React.useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // On page load or when changing themes, best to add inline in `head` to avoid FOUC
    if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark')
      setIsDark(true);
    } else {
      document.documentElement.classList.remove('dark')
      setIsDark(false);
    }
  }, []);

  const toggleDark = () => {
    const html = document.documentElement;
    const dark = html.classList.contains('dark');
    html.classList.toggle('dark', !dark);
    setIsDark(!dark);
    localStorage.setItem('theme', !dark ? 'dark' : 'light');
  }

  return (
    <AuroraBackground>
      <motion.div
        initial={{ opacity: 0.0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{
          delay: 0.3,
          duration: 0.8,
          ease: "easeInOut",
        }}
        className="relative flex flex-col gap-4 items-center justify-center px-4"
      >
        <button onClick={() => toggleDark()} className={isDark ? 'text-white' : 'text-black'}>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
          </svg>
        </button>
        
        <div className="text-md font-bold dark:text-white text-center select-none">
          ccbs + fci + ee
        </div>

        <div className="text-3xl md:text-7xl font-bold dark:text-white text-center select-none">
          facial recognition
        </div>
        <div className="font-extralight text-base md:text-4xl dark:text-neutral-200 py-4 select-none">
          test it.
        </div>
        <button 
          className="bg-black dark:bg-white rounded-full w-fit text-white dark:text-black px-4 py-2"
          onClick={() => {
            navigate("/register");
          }}
        >
          register
        </button>
      </motion.div>
    </AuroraBackground>
  );
}

export default Home;
