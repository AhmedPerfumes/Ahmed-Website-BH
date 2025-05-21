import Image from "next/image";
import React from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";

export default function WeddingPromotion() {
  const t = useTranslations();
  return (
    <div style={{ backgroundColor: "#fffaef" }}>
      <div className="container text-center pt-5 mt-5 mb-5 pb-5" >
        <h4 className="fs-4 text-uppercase" style={{ color: "#c68d12" }}>
          We would like to create your memorable day to be remembered forever!
        </h4>
        <h2 className="fs-2 text-uppercase pt-4">Elevate your wedding experience</h2>
      </div>
      <div className="container">
        <div className="row align-items-center">
          <div className="col-md-6"  >
            <Image
                width={0}
                height={0}
                sizes="100%"
                className="img-fluid"
                src="/assets/images/wedding/multiple-products-1.png"
                alt="wedding-products"
                loading="lazy"
                style={{ width:'100%', height: 'auto'}}
            />
          </div>
          <div className="col-md-6 px-5 mb-2">
            <p className="fs-2 text-center text-uppercase">
              Indulge in the Scent of Love
            </p>
            <p className="fs-6 text-center">
              Creating a truly aromatic ambiance that complements your special
              day.
            </p>
            <p className="fs-6 text-center">
              Discover the perfect blend of elegance and fragrance, as we curate
              a scented journey to accompany your magical celebration, leaving
              lasting memories for you and your guests.
            </p>
            <p className="fs-6 text-center">
              Trust us to make your wedding an unforgettable sensory experience.
            </p>
          </div>
        </div>
      </div>
      <div className="container">
  <div className="row align-items-center">
    {/* Image column - shown first on mobile/tablet, second on desktop */}
    <div className="col-md-6 order-1 order-md-2">
      <Image
                width={0}
                height={0}
                sizes="100%"
                className="img-fluid"
                src="/assets/images/wedding/multiple-products-2.png"
                alt="wedding-products"
                loading="lazy"
                style={{ width:'100%', height: 'auto'}}
            />
    </div>

    {/* Text column - shown second on mobile/tablet, first on desktop */}
    <div className="col-md-6 px-5 mb-2 order-2 order-md-1">
      <p className="fs-2 text-center text-uppercase">
        Wedding Service we offer
      </p>
      <p className="fs-6 text-center">
        We provide a perfuming service for the purpose of welcoming your
        guests with some of the best Arabic and French perfumes as well as
        luxury oils with incense and Oud Ma'attar.
      </p>
      <p className="fs-6 text-center">
        Elevate every welcoming moment with a delicate blend of scents
        that captivate and embrace, leaving an indelible mark of
        sophistication and luxury.
      </p>
    </div>
  </div>
</div>

      <div className="container pt-5">
        <h2 className="fs-2 text-uppercase text-center mb-5">
          Wedding Packages
        </h2>

        <div className="row">
          <div className="col-md-6 text-center">
            
            <Image
                width={0}
                height={0}
                sizes="100%"
                className="img-fluid mb-3"
                src="/assets/images/wedding/setup1-bh-qa.png"
                alt="First Wedding Package"
                loading="lazy"
                style={{ width:'500px', height: 'auto'}}
            />
            <h3 className="fs-3 text-uppercase">Enchanting Harbor</h3>
            <h4 className="fs-6 text-uppercase fw-bold">package 1</h4>
            <h4 className="fs-5 fw-bold" style={{ color: "#C58B14" }}>
              BHD 400
            </h4>

            <p className="lh-sm">With AMG Luxury Stand</p>
            <p className="lh-sm">1 Gift for the Bride & Groom</p>
            <p className="lh-sm">18 best-selling perfumes</p>
            <p className="lh-sm">4 types of Luxury oils (Arabic & French)</p>
            <p className="lh-sm">3 types of Bakhoor</p>
            <p className="lh-sm">3 types of Oud Ma'attar</p>
            <p className="lh-sm">2 Staff with traditional dress</p>

            {/* <div className="d-flex justify-content-center pt-4">
              <Link
                href="/shop"
                className="btn-link btn-link_lg default-underline text-uppercase fw-medium "
              >
                Know More
              </Link>
            </div> */}
          </div>

          <div className="col-md-6 text-center">
            <Image
                width={0}
                height={0}
                sizes="100%"
                className="img-fluid mb-3"
                src="/assets/images/wedding/setup-2.png"
                alt="Wedding Package 2"
                loading="lazy"
                style={{ width:'500px', height: 'auto'}}
            />
            <h3 className="fs-3 text-uppercase">Modern Bliss</h3>
            <h4 className="fs-6 text-uppercase fw-bold pt-1">package 2</h4>
            <h4 className="fs-5 fw-bold" style={{ color: "#C58B14" }}>
              BHD 300 
            </h4>

            <p className="lh-sm">With AMG Luxury Stand</p>
            <p className="lh-sm">15 best-selling perfumes</p>
            <p className="lh-sm">2 types of luxury oils (Arabic & French)</p>
            <p className="lh-sm">2 kinds of High-end Bakhoor</p>
            <p className="lh-sm">2 kinds of High-end Oud Ma'attar</p>
            <p className="lh-sm">2 Staff with traditional dress</p>
            {/* <div className="d-flex justify-content-center pt-4">
              <Link
                href="/shop"
                className="btn-link btn-link_lg default-underline text-uppercase fw-medium"
              >
                Know More
              </Link>
            </div> */}
          </div>
        </div>
      </div>
      <div className="container pt-5">
        <div className="row">
          <div className="col-md-6 text-center">
            <Image
                width={0}
                height={0}
                sizes="100%"
                className="img-fluid mb-3"
                src="/assets/images/wedding/setup-3.png"
                alt="Wedding Package 3"
                loading="lazy"
                style={{ width:'500px', height: 'auto'}}
            />
            <h3 className="fs-3 text-uppercase">Precious</h3>
            <h4 className="fs-4 text-uppercase fw-bold">package 3</h4>
            <h4 className="fs-5 fw-bold" style={{ color: "#C58B14" }}>
              BHD 200 
            </h4>

            <p className="lh-sm">With AMG Metallic stand</p>
            <p className="lh-sm">12 best-selling perfumes</p>
            <p className="lh-sm">2 types of luxury oils (Arabic & French)</p>
            <p className="lh-sm">2 types of Bakhoor</p>
            <p className="lh-sm">2 types of Oud Ma'attar</p>
            <p className="lh-sm">2 Staff with traditional dress</p>
            {/* <div className="d-flex justify-content-center pt-4">
              <Link
                href="/shop"
                className="btn-link btn-link_lg default-underline text-uppercase fw-medium"
              >
                Know More
              </Link>
            </div> */}
          </div>

          <div className="col-md-6 text-center">
            <Image
                width={0}
                height={0}
                sizes="100%"
                className="img-fluid mb-3"
                src="/assets/images/wedding/setup-4.png"
                alt="Wedding Package 4"
                loading="lazy"
                style={{ width:'500px', height: 'auto'}}
            />
            <h3 className="fs-3 text-uppercase">Bouquet of Scents</h3>
            <h4 className="fs-4 text-uppercase fw-bold">package 4</h4>
            <h4 className="fs-5 fw-bold" style={{ color: "#C58B14" }}>
              BHD 150 
            </h4>

            <p className="lh-sm">Without AMG stand</p>
            <p className="lh-sm">10 best-selling perfumes</p>
            <p className="lh-sm">2 types of luxury oils (Arabic & French)</p>
            <p className="lh-sm">2 types of Oud Ma'attar</p>
            <p className="lh-sm">1 Staff with traditional dress</p>
            {/* <div className="d-flex justify-content-center pt-4">
              <Link
                href="/shop"
                className="btn-link btn-link_lg default-underline text-uppercase fw-medium"
              >
                Know More
              </Link>
            </div> */}
          </div>
        </div>
      </div>
      <div className="container giveaway pt-5">
  <h2 className="fs-2 text-uppercase text-center">Giveaways</h2>
  <div className="row align-items-center mt-4">
    <div className="col-md-4">
      <Image
                width={0}
                height={0}
                sizes="100%"
                className="img-fluid mb-3"
                src="/assets/images/wedding/memories-1.png"
                alt="Giveaway"
                loading="lazy"
                style={{ width:'80%', height: 'auto'}}
            />
    </div>
    <div className="col-md-8">
      <div className="row">
        <div className="col-md-4">
          <div className="p-3  text-center">
            <p className="text-uppercase fw-bold">Memory Box 1</p>
            <h4 className="fs-5 fw-bold" style={{ color: "#C58B14" }}>
            Price: BHD 1.1 
            </h4>
            <div className="d-flex text-center flex-column">

            <span className="fw-bold">Contains</span>
            <span className="">2 perfume tester 2ml</span>
            <span className="">1 pc Bakhoor</span>
            </div>
           
          </div>
        </div>
        <div className="col-md-4">
        <div className="p-3  text-center">
            <p className="text-uppercase fw-bold">Memory Box 2</p>
            <h4 className="fs-5 fw-bold" style={{ color: "#C58B14" }}>
            Price: BHD 1.7
            </h4>
            <div className="d-flex text-center flex-column">

            <span className="fw-bold">Contains</span>
            <span className="">1 perfume tester 2ml</span>
            <span className="">1 pc Bakhoor</span>
            <span>1 concentrated oil</span>
            </div>
           
          </div>
        </div>
        <div className="col-md-4">
        <div className="p-3  text-center">
            <p className="text-uppercase fw-bold">Memory Box 3</p>
            <h4 className="fs-5 fw-bold" style={{ color: "#C58B14" }}>
            Price: BHD 2.2
            </h4>
            <div className="d-flex text-center flex-column">

            <span className="fw-bold">Contains</span>
            <span className="">2 perfume testers 2ml</span>
            <span className="">1 pc Bakhoor</span>
            <span>1 concentrated oil</span>
            </div>
           
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

      <div className="container pt-5">
        <div className="row align-items-center">
          <div className="col-md-6 px-5 mb-2">
            <p className="fs-2 text-center text-uppercase">
              For the Joy of a Lifetime... a Fragrance that Lasts a Lifetime{" "}
            </p>
            <p className="fs-6 text-center">
              The wedding day is a day that will be remembered forever. And how
              beautiful it would be if the joy of life was crowned with a
              breath-taking fragrant and a precious memory that will be
              remembered at all times.
            </p>
            <p className="fs-6 text-center">
              Ahmed Al Maghribi Perfumes offers you a wedding service and the
              possibility of being present at wedding parties with the finest
              types of incense, luxurious oils, fragrant oud perfumes that are
              presented in coordination distinctive honoring guests.
            </p>
          </div>

          <div className="col-md-6">
            <Image
                width={0}
                height={0}
                sizes="100%"
                className="img-fluid mb-3"
                src="/assets/images/wedding/weeding-min.png"
                alt="Wedding Package"
                loading="lazy"
                style={{ width:'100%', height: 'auto'}}
            />
          </div>
        </div>
      </div>
      <div className="pt-5"></div>
      <div className="container pt-5" style={{border:"1px solid #cecece", backgroundColor: "#fffbf3" }}>
        <div className="row align-items-center">
          <div className="col-md-12 px-5 mb-2">
            <p className="fs-2 text-center text-uppercase">
              For Customization and additional services{" "}
            </p>
            <p className="fs-4 fw-bold text-center text-uppercase">
              Contact{" "}
            </p>
            <p className="fs-6 fw-bold text-center" >
              <Link
                href="mailto:customersupport@ahmedalmaghribi.com"
                className="btn-link btn-link_lg fw-bold" style={{ color: "#C58B14" }}
              >
                customersupport@ahmedalmaghribi.com
              </Link>
              
            </p>
            <p className="fs-6 fw-bold text-center" style={{ color: "#C58B14" }}>
              +973 39 401417 
            </p>
          </div>
        </div>
      </div>
      <div className="pt-5"></div>
    </div>
  );
}
