// Generic content page. All copy lives in src/data/pages/*.ts as PageSpec objects and is rendered by <ContentPage/>.
import ContentPage from "@/components/blocks/ContentPage";
import { SEEKER_PAGES } from "@/data/pages/seekers";
import { EMPLOYER_PAGES } from "@/data/pages/employers";
import { COMPANY_PAGES } from "@/data/pages/company";
import NotFound from "./NotFound";

const PAGES = { ...SEEKER_PAGES, ...EMPLOYER_PAGES, ...COMPANY_PAGES };

const InfoPage = ({ slug }: { slug: string }) => {
  const spec = PAGES[slug];
  return spec ? <ContentPage spec={spec} /> : <NotFound />;
};
export default InfoPage;
