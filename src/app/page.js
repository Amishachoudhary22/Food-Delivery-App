import Header from "@/components/layout/Header";
import Hero from "@/components/layout/Hero";
import HomeMenu from "@/components/layout/HomeMenu";
import SectionHeaders from "@/components/layout/SectionHeaders";
import Image from "next/image";

export default function Home() {
  return (
    <>
      
      <Hero />
      <HomeMenu />
      <section>
        <SectionHeaders 
        subHeader={"Our Story"}
        mainHeader={"About us"}
        />
        <div className="text-gray-500 max-w-md mx-auto mt-4 flex flex-col gap-4">
          <p>
          Welcome to Tasty Foods, where we bring your favorite meals to your doorstep with just a few taps! Our mission is to connect you with local restaurants, ensuring fresh, delicious, and diverse cuisine is always within reach. Whether you're craving a quick snack, a hearty meal, or an indulgent dessert, we've got you covered.
          </p>
          <p>
          Our platform is designed for speed, simplicity, and satisfaction, delivering not just food but also a seamless experience. With a focus on quality and reliability, we're here to make your mealtime moments more enjoyable. Sit back, relax, and let us do the rest!
          </p>
        </div>
      </section>
      <section className="text-center my-8">
        <SectionHeaders 
        subHeader={"Don\'t hesitate"}
        mainHeader={"Contact us"}
        />
        <div className="mt-8">
        <a className="text-4xl underline text-gray-500" href="tel:+91 7381231230">
          +91 73812 31230
        </a>
        </div>
        
        </section>
        
    </>
  )
}
