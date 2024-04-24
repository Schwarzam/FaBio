

import React, {useEffect, useState} from "react";
import { AuroraBackground } from "./ui/aurora";
import { motion } from "framer-motion";

import { useNavigate } from "react-router-dom";

import { get_elements } from "./helpers/helpers";

function Home() {

  const [elements, setElements] = useState({});

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

    const result = get_elements();
    setElements(result);

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
        
        <div className="text-xl font-bold dark:text-white text-center select-none">
          welcome
        </div>
        <div className="text-md font-bold dark:text-white text-center select-none">
          you are authenticated as 
        </div>

        <div className="text-md font-bold dark:text-white text-center select-none">
          {elements['last_name'] && elements['last_name']}, {elements['first_name'] && elements['first_name']}
        </div>

        <div className="text-lg font-bold dark:text-white text-center select-none">
          {elements['something'] && elements['something']}
        </div>

      </motion.div>
    </AuroraBackground>
  );
}

export default Home;
