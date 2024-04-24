

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
        <div className='pt-12'>
              <button onClick={() => navigate("/")} className='dark:text-white border p-4 rounded-xl'>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                      <path stroke-linecap="round" stroke-linejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                  </svg>
              </button>
          </div>
        
        <div className="text-2xl font-bold dark:text-white text-center select-none">
          welcome
        </div>
        <div className="text-md font-bold dark:text-white text-center select-none">
          authenticated as {elements['last_name'] && elements['last_name']}, {elements['first_name'] && elements['first_name']}
        </div>

        <div className="text-md dark:text-white text-center select-none">
          {elements['email'] && elements['email']}
        </div>

        <div className="text-md font-bold dark:text-white text-center select-none">
          Don't worry, we have your secret well kept.
        </div>
        <div className="text-sm border p-4 rounded-lg font-bold dark:text-white text-center select-none">
          {elements['something'] && elements['something']}
        </div>

      </motion.div>
    </AuroraBackground>
  );
}

export default Home;
