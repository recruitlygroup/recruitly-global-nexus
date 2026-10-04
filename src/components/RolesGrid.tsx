// "Roles We Consistently Fill" — visual grid with real-photo slots.
import PhotoSlot from "./PhotoSlot";

const ROLES = [
  { title: "Nurses",      photo: "nurses.jpg",      alt: "Nurse caring for a patient" },
  { title: "Drivers",     photo: "drivers.jpg",     alt: "Heavy goods vehicle driver" },
  { title: "Hospitality", photo: "hospitality.jpg", alt: "Hotel and restaurant staff" },
  { title: "Engineers",   photo: "engineers.jpg",   alt: "Engineers on a project site" },
  { title: "Artisans",    photo: "artisans.jpg",    alt: "Carpenter and skilled tradesperson" },
];

const RolesGrid = () => (
  <section>
    <h2 className="text-2xl md:text-3xl font-extrabold text-primary mb-8">Roles we consistently fill</h2>
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {ROLES.map((r) => (
        <figure key={r.title} className="relative rounded-md overflow-hidden group">
          <PhotoSlot file={r.photo} alt={r.alt} className="w-full h-56 md:h-64 group-hover:scale-105 transition-transform duration-500" />
          <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-4 text-white font-bold">{r.title}</figcaption>
        </figure>
      ))}
    </div>
  </section>
);
export default RolesGrid;
