/**
 * Official licenses & certificates shown on the About page.
 * Images live in /public/images/certificates/
 */
export type Certificate = {
  id: string;
  title: string;
  /** Path under /public */
  image: string;
  issuer?: string;
  year?: string;
};

export const certificates: Certificate[] = [
  {
    id: "phc-regular-license",
    title: "PHC Regular License - Tibb Clinic",
    image: "/images/certificates/phc-regular-license-hashmi-herbal-dawakhana.webp",
    issuer: "Punjab Healthcare Commission",
    year: "RL 2051911685",
  },
  {
    id: "nct-licence-practice",
    title: "Licence to Practice - Tabeeb Mubashar Akhtar",
    image: "/images/certificates/nct-licence-to-practice-tabeeb-mubashar-akhtar.webp",
    issuer: "National Council for Tibb, Government of Pakistan",
    year: "Reg. QH-17352-A",
  },
];
