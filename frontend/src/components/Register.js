import React, { useEffect, useRef, useState } from 'react';
import { AuroraBackground } from './ui/aurora';
import { motion } from 'framer-motion';
import { post } from './helpers/helpers';
import { LabelInputContainer } from './helpers/elements';
import { Label } from "./ui/label";
import { Input } from "./ui/input";

import Webcam from "react-webcam";


export default function Register() {
    const videoRef = useRef(null);
    const [canvasSize, setCanvasSize] = useState({ width: 360, height: 360 });

    const [email, setEmail] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');

    const steps = ['straight', 'left', 'right', 'take'];
    const steps_messages = [
      'Please look straight and center your face.', 
      'Please look to the left.', 
      'Please look to the right.', 
      'Thank you! All steps completed.'
    ];
    const [currentStep, setCurrentStep] = useState(0);
    
    useEffect(() => {
        async function setupVideo() {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true });
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
            } catch (err) {
                console.error('Error accessing video stream:', err);
            }
        }

        setupVideo();

        function updateCanvasSize() {
            const maxWidth = window.innerWidth > 360 ? 360 : window.innerWidth - 20;
            const maxHeight = window.innerHeight > 360 ? 360 : window.innerHeight - 20;
            setCanvasSize({ width: maxWidth, height: maxHeight });
        }

        window.addEventListener('resize', updateCanvasSize);
        updateCanvasSize();

        return () => {
            window.removeEventListener('resize', updateCanvasSize);
        };
    }, []);

    const register = async () => {
        if (!videoRef.current) return;

        const canvas = document.createElement('canvas');
        canvas.width = 1024;
        canvas.height = 1024;

        const ctx = canvas.getContext('2d');

        if ( navigator.userAgentData.platform != "iPad" && navigator.userAgentData.platform != "iPhone" && navigator.userAgentData.platform != "iPod" ) {
		    canvas.width = window.outerWidth; 
            //I'll use window.innerWidth in production
	    } else {
		    canvas.width = 360;
	    }

        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

        if ( navigator.userAgentData.platform != "iPad" && navigator.userAgentData.platform != "iPhone" && navigator.userAgentData.platform != "iPod" ) {
		    canvas.width = window.outerWidth; 
            //I'll use window.innerWidth in production
	    } else {
		    canvas.width = 360;
	    }


        canvas.toBlob(blob => {
            if (blob) {
                blob.arrayBuffer().then(buffer => {
                    var formData = new FormData();
                    formData.append('imageUpload', new Blob([buffer], { type: 'image/jpeg' }), 'image.jpg');
                    formData.append('email', email);

                    post('/api/register/', formData)
                        .then(response => {
                            console.log(response);
                        })
                        .catch(error => {
                            console.error(error);
                        });
                });
            }
        }, 'image/jpeg');
    };


    const captureFrame = async () => {
        if (!videoRef.current) return;
    
        const canvas = document.createElement('canvas');
        canvas.width = canvasSize.width;
        canvas.height = canvasSize.height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

        canvas.toBlob(blob => {
            if (blob) {
                blob.arrayBuffer().then(buffer => {
                    var formData = new FormData();
                    formData.append('imageUpload', new Blob([buffer], { type: 'image/jpeg' }), 'image.jpg');
                    formData.append('email', email);
                    formData.append('direction', steps[currentStep]);

                    post('/api/test_side_face/', formData)
                        .then(response => {
                            console.log(response);
                            // Move to the next step based on current direction
                            response['correct'] && setCurrentStep(currentStep + 1);

                            if (currentStep === steps.length - 1) {
                                register();
                            }

                        })
                        .catch(error => {
                            console.error(error);
                        });
                });
            }
        }, 'image/jpeg');
    };
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
              <div className="max-w-md w-full mx-auto rounded-none md:rounded-2xl p-4 md:p-8 shadow-input text-black dark:text-white bg-white dark:bg-black">
                <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2 mb-4">
                    <LabelInputContainer>
                        <Label htmlFor="firstname">First name</Label>
                        <Input id="firstname" placeholder="Vincas" type="text" onChange={(e) => setFirstName(e.target.value)} />
                    </LabelInputContainer>
                    <LabelInputContainer>
                        <Label htmlFor="lastname">Last name</Label>
                        <Input id="lastname" placeholder="Oliveira" type="text" onChange={(e) => setLastName(e.target.value)} />
                    </LabelInputContainer>
                    </div>
                  <LabelInputContainer className="mb-4">
                      <Label htmlFor="email">Email Address</Label>
                      <Input id="email" placeholder="projectmayhem@mack.com" type="email" onChange={(e) => setEmail(e.target.value)} />
                  </LabelInputContainer>

                    <LabelInputContainer className="mb-4">
                        <Label htmlFor="something">Something about you</Label>
                        <Input id="something" placeholder="Corinthians" type="something" />
                    </LabelInputContainer>

                  <p>{steps_messages[currentStep]}</p>  {/* Display the instructions to the user */}
                  
                  <video ref={videoRef} preload={null} autoPlay playsInline muted style={{ width: '100%' }} />
                  
                  <Webcam height={600} width={600} />

                  <div className="flex justify-around mt-4">
                      <button onClick={captureFrame} className="btn bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                          Capture Frame
                      </button>
                      {/* {direction && (  // Only show the stop button if a direction has been set
                          <button onClick={stopFrameCapture} className="btn bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">
                              Stop Capture
                          </button>
                      )} */}
                  </div>
              </div>
          </motion.div>
      </AuroraBackground>
  );
}