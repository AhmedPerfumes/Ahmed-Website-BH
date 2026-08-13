import React from "react";
import { useLocale,useTranslations } from "next-intl";

export default function AdditionalInfo({ product, product_name, video, title }) {
  const t = useTranslations();
   const locale = useLocale();
  const isAr = locale === "ar";
  function cleanProductName(productName) {
    // Step 1: Remove any non-alphanumeric characters except for spaces
    if (!productName) return "";
    const dynamicKey = productName.replace(/[^a-zA-Z0-9\s]/g, '') + ' Notes';
  
    // Step 2: Words to remove
    const wordsToRemove = ['&', ' &', '& ', ' & ', 'amp', ' amp', 'amp ', ' amp ', ';', ' ;', '; ', ' ; '];
  
    // Step 3: Remove the words from the dynamic key (case insensitive)
    let cleanString = dynamicKey;
    wordsToRemove.forEach(word => {
      const regex = new RegExp(word, 'gi'); // 'gi' for global and case-insensitive replacement
      cleanString = cleanString.replace(regex, '');
    });
  
    // Step 4: Replace multiple spaces with a single space
  return cleanString.replace(/\s+/g, ' ').trim();
  }

  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
    return `${process.env.NEXT_PUBLIC_API_URL}storage/${imagePath}`;
  };

  // Check if we have the new tabbed/structured fragrance notes
  const hasNewNotes = product && (
    product.top_note || 
    product.heart_note || 
    product.base_note || 
    product.top_note_description || 
    product.heart_note_description || 
    product.base_note_description ||
    product.top_note_ar ||
    product.heart_note_ar ||
    product.base_note_ar ||
    product.top_note_description_ar ||
    product.heart_note_description_ar ||
    product.base_note_description_ar
  );

  const notesList = [
    {
      type: "top",
      title: isAr ? "المكونات العليا" : "Top Notes",
      note: isAr ? (product?.top_note_ar || product?.top_note) : product?.top_note,
      image: getImageUrl(product?.top_note_image),
      description: isAr ? (product?.top_note_description_ar || product?.top_note_description) : product?.top_note_description,
    },
    {
      type: "heart",
      title: isAr ? "المكونات الوسطى" : "Heart Notes",
      note: isAr ? (product?.heart_note_ar || product?.heart_note) : product?.heart_note,
      image: getImageUrl(product?.heart_note_image),
      description: isAr ? (product?.heart_note_description_ar || product?.heart_note_description) : product?.heart_note_description,
    },
    {
      type: "base",
      title: isAr ? "المكونات الأساسية" : "Bottom Notes",
      note: isAr ? (product?.base_note_ar || product?.base_note) : product?.base_note,
      image: getImageUrl(product?.base_note_image),
      description: isAr ? (product?.base_note_description_ar || product?.base_note_description) : product?.base_note_description,
    },
  ].filter(n => n.note || n.image || n.description);

  const topNote = notesList.find(n => n.type === "top");
  const heartNote = notesList.find(n => n.type === "heart");
  const baseNote = notesList.find(n => n.type === "base");
  return (
    <>
      
      {/* <div dangerouslySetInnerHTML={{ __html: t.raw(cleanProductName(product_name)) }}></div>
      <div className="align-items-lg-center mb-5">
        <div className="col-lg-12 d-flex align-items-center justify-content-center mb-5">
          <h2 className="mb-3 text-white">
            { title }
          </h2>
        </div>
        {video &&
          <div className="image-wrapper col-lg-12">
            <video
              className="h-auto w-100"
              autoPlay
              loop
              muted
              controls
              src={`${process.env.NEXT_PUBLIC_API_URL}storage/${video}`} type="video/mp4" width={200}
              alt=""
            />
          </div>
        }
      </div> */}
       {hasNewNotes && notesList.length > 0 ? (
        <div className="container py-4">
          {/* Top Notes */}
          {topNote && (
            <div className="d-lg-flex align-items-lg-center mb-5">
              <p className="d-none d-lg-block">&nbsp;</p>
              {topNote.image && (
                <p className="mb-0 flex-shrink-0" style={{ maxWidth: "380px" }}>
                  <img src={topNote.image} alt={topNote.title} className="img-fluid" />
                </p>
              )}
              <div className={`content-wrapper col-lg-7 px-lg-5 text-white ${isAr ? "text-end" : "text-start"}`}>
                <h3 className="mb-3 text-white">
                  {topNote.title}
                </h3>
                {topNote.note && (
                  <p className="fw-semibold text-white mb-2" style={{ fontSize: "1.05rem", color: "#e5d4b2" }}>
                    {topNote.note}
                  </p>
                )}
                {topNote.description && (
                  <div className="text-white" style={{ lineHeight: "1.8", fontSize: "0.95rem" }} dangerouslySetInnerHTML={{ __html: topNote.description }} />
                )}
              </div>
            </div>
          )}

          {/* Heart Notes */}
          {heartNote && (
            <div className="d-lg-flex align-items-lg-center mb-5 flex-column-reverse flex-lg-row">
              <div className={`content-wrapper col-lg-7 px-lg-5 order-2 order-lg-1 text-white ${isAr ? "text-end" : "text-start"}`}>
                <h3 className="mb-3 text-white">
                  {heartNote.title}
                </h3>
                {heartNote.note && (
                  <p className="fw-semibold text-white mb-2" style={{ fontSize: "1.05rem", color: "#e5d4b2" }}>
                    {heartNote.note}
                  </p>
                )}
                {heartNote.description && (
                  <div className="text-white" style={{ lineHeight: "1.8", fontSize: "0.95rem" }} dangerouslySetInnerHTML={{ __html: heartNote.description }} />
                )}
              </div>
              {heartNote.image && (
                <p className="order-1 order-lg-2 mb-0 flex-shrink-0" style={{ maxWidth: "380px" }}>
                  <img className="img-fluid" src={heartNote.image} alt={heartNote.title} />
                </p>
              )}
            </div>
          )}

          {/* Bottom Notes */}
          {baseNote && (
            <div className="d-lg-flex align-items-lg-center mb-5">
              <p className="d-none d-lg-block">&nbsp;</p>
              {baseNote.image && (
                <p className="mb-0 flex-shrink-0" style={{ maxWidth: "380px" }}>
                  <img src={baseNote.image} alt={baseNote.title} className="img-fluid" />
                </p>
              )}
              <div className={`content-wrapper col-lg-7 px-lg-5 text-white ${isAr ? "text-end" : "text-start"}`}>
                <h3 className="mb-3 text-white">
                  {baseNote.title}
                </h3>
                {baseNote.note && (
                  <p className="fw-semibold text-white mb-2" style={{ fontSize: "1.05rem", color: "#e5d4b2" }}>
                    {baseNote.note}
                  </p>
                )}
                {baseNote.description && (
                  <div className="text-white" style={{ lineHeight: "1.8", fontSize: "0.95rem" }} dangerouslySetInnerHTML={{ __html: baseNote.description }} />
                )}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Fallback to old behavior using JSON translation file */
        <div dangerouslySetInnerHTML={{ __html: t.raw(cleanProductName(product_name)) }}></div>
      )}

      {/* Video section */}
      {(video || title) && (
        <div className="align-items-lg-center mt-5 mb-5 w-100">
          {(title) && (
            <div className="col-lg-12 d-flex align-items-center justify-content-center mb-4">
              <h2 className="mb-3 text-white text-center">
                {title}
              </h2>
            </div>
          )}
          {video && (
            <div className="image-wrapper col-lg-12 d-flex justify-content-center">
              <video
                className="h-auto w-100"
                style={{ maxWidth: "800px", borderRadius: "8px" }}
                autoPlay
                loop
                muted
                controls
                src={`${process.env.NEXT_PUBLIC_API_URL}storage/${video}`}
                type="video/mp4"
              />
            </div>
          )}
        </div>
      )}
    </>
  );
}
