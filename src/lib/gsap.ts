import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { Flip } from 'gsap/Flip';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger, SplitText, Flip, useGSAP);
gsap.defaults({ ease: 'power3.out', duration: 0.9 });

export { gsap, ScrollTrigger, SplitText, Flip, useGSAP };
