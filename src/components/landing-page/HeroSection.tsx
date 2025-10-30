import { motion } from "framer-motion";
import Image from "next/image";

export default function HeroSection() {
  return (
    <main className="relative mt-40 md:mt-80 flex flex-col w-full px-4 md:p-20 md:max-w-[1920px]">
      <div className="flex flex-col md:flex-row md:gap-40">
        <div className="flex flex-col w-fit gap-8">
          <h1 className="font-sans text-8xl md:text-9xl font-bold md:max-w-4xl">
            WE GET YOU{" "}
            <motion.span
              initial={{ x: -50, opacity: 0, scale: 1 }}
              animate={{ x: 0, opacity: 1, scale: 1 }}
              transition={{ delay: 0.1, duration: 0.6, ease: "easeInOut" }}
              className="text-yuvi-rose font-fancy inline-block"
            >
              MOViNG!
            </motion.span>
          </h1>
          <p className="text-3xl md:text-4xl font-semibold max-w-4xl">
            We turn unused Spaces, <br /> into your playground.
          </p>
        </div>
        <Image
          src="/hero-section-runner-dummy.webp"
          width={1000}
          height={1080}
          alt="Hero Section Image"
          className="z-10 absolute bottom-40 -right-20 md:top-0 md:right-0"
        />
        <svg
          width="1759"
          height="1228"
          viewBox="0 0 1759 1228"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="absolute"
        >
          <path
            d="M20.8967 1078.96C5.40374 1097.3 -2.01948 1120.92 0.473876 1144.8C2.95482 1168.67 15.1486 1190.84 34.159 1206.26C53.1693 1221.68 77.3775 1229.04 101.244 1226.55C125.123 1224.07 146.705 1211.94 161.456 1193C161.456 1193 161.456 1193 161.456 1193C197.933 1146.14 235.772 1102.42 276.342 1060.37C473.368 855.686 730.786 702.055 1010.01 646.486C1146.1 620.282 1300.66 614.095 1410.38 668.26C1463.89 699.779 1476.27 723.131 1448.62 774.589C1419.12 824.193 1361.71 868.716 1300.87 906.802C1201.85 970.105 1069.26 1017.45 1034.19 929.615C995.027 837.692 1027.23 703.889 1071.47 593.743C1164.67 369.432 1337.65 165.132 1568.16 76.1021C1624.16 54.8076 1682.23 41.1927 1742.38 35.9386C1747.05 35.5322 1751.39 33.2579 1754.47 29.6697C1757.55 26.0784 1759.1 21.4673 1758.79 16.7971C1758.47 12.1268 1756.32 7.76471 1752.79 4.61674C1749.26 1.47188 1744.65 -0.201103 1739.97 0.0194088C1739.97 0.0194088 1739.97 0.0194088 1739.97 0.0194088C1676.28 3.08442 1614.02 15.0613 1553.6 35.3759C1304.26 121.049 1113.94 328.402 1004.36 564.821C954.305 684.597 902.573 816.006 953.81 965.417C969.12 1002.45 999.377 1038.45 1040.52 1056.28C1079.79 1074.02 1123.8 1074.51 1158.74 1069.58C1232.78 1058.33 1293.38 1028.91 1353.48 995.244C1422.73 954.34 1490.77 911.729 1543.78 833.198C1568.57 795.857 1589.04 735.578 1569.99 678.315C1551.37 621.353 1509.01 586.587 1469.79 563.287C1307.52 478.468 1142.42 489.081 986.198 510.222C671.746 560.184 381.575 718.81 153.859 937.137C107.078 981.951 63.2496 1028.7 20.8967 1078.96Z"
            fill="url(#paint0_linear_281_10)"
            fillOpacity="0.5"
          />
          <defs>
            <linearGradient
              id="paint0_linear_281_10"
              x1="1711.18"
              y1="75.7285"
              x2="133.54"
              y2="1135.28"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#FFB0E2" stopOpacity="0" />
              <stop offset="0.1875" stopColor="#FFB0E2" />
              <stop offset="0.716346" stopColor="#3BB7FC" />
              <stop offset="1" stopColor="#3BB7FC" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </main>
  );
}
