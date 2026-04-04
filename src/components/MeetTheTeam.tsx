import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Instagram, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import binitaPhoto from "@/assets/team-binita.jpeg";
import ashokPhoto from "@/assets/team-ashok.png";

const team = [
  {
    name: "Binita Pahadi",
    role: "Assistant Manager",
    description:
      "Specializing in student recruitment and visa processing for Italy and the EU. Fluent in Nepali, Hindi, and English.",
    photo: binitaPhoto,
    instagram: "https://instagram.com/recruitlygroup",
    email: "binita@recruitlygroup.com",
  },
  {
    name: "Ashok Adhikari",
    role: "Head of Operations at Recruitly Group",
    description:
      "Proficient in Italy student visas and Albania work visas. Drives operational excellence across all Recruitly Group divisions.",
    photo: ashokPhoto,
    instagram: "https://instagram.com/im_real_ashok",
    email: "ashok@recruitlygroup.com",
  },
];

const MeetTheTeam = () => {
  const [selected, setSelected] = useState<number | null>(null);

  return (
    <section className="py-20 bg-background relative z-10">
      <div className="max-w-7xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
            Meet Our Team
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Your Guides to Global Opportunities
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {team.map((member, i) => (
            <motion.div
              key={member.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
            >
              <Card
                className="overflow-hidden h-full border-border/50 shadow-lg cursor-pointer transition-all duration-300 hover:shadow-2xl hover:scale-[1.03] hover:-translate-y-1"
                onClick={() => setSelected(i)}
              >
                <div className="aspect-[3/4] bg-muted overflow-hidden">
                  {member.photo ? (
                    <img
                      src={member.photo}
                      alt={member.name}
                      className="w-full h-full object-cover object-top transition-transform duration-500 hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground text-6xl font-bold select-none bg-gradient-to-br from-muted to-secondary">
                      {member.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </div>
                  )}
                </div>

                <CardContent className="p-6 flex flex-col gap-2">
                  <h3 className="text-xl font-semibold text-foreground">
                    {member.name}
                  </h3>
                  <p className="text-sm font-medium text-accent">
                    {member.role}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Click to view full profile
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Slide-over Modal */}
      <AnimatePresence>
        {selected !== null && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelected(null)}
            />
            <motion.div
              className="fixed right-0 top-0 h-full w-full max-w-md bg-card border-l border-border shadow-2xl z-50 overflow-y-auto"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
            >
              <div className="sticky top-0 bg-card/90 backdrop-blur-md p-4 flex justify-end z-10">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSelected(null)}
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <div className="px-6 pb-10">
                <div className="aspect-[3/4] rounded-xl overflow-hidden bg-muted mb-6">
                  {team[selected].photo ? (
                    <img
                      src={team[selected].photo}
                      alt={team[selected].name}
                      className="w-full h-full object-cover object-top"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground text-7xl font-bold select-none bg-gradient-to-br from-muted to-secondary">
                      {team[selected].name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </div>
                  )}
                </div>

                <h3 className="text-2xl font-bold text-foreground mb-1">
                  {team[selected].name}
                </h3>
                <p className="text-base font-medium text-accent mb-4">
                  {team[selected].role}
                </p>
                <p className="text-muted-foreground leading-relaxed mb-6">
                  {team[selected].description}
                </p>

                <div className="flex gap-3">
                  <Button variant="outline" size="sm" className="gap-2" asChild>
                    <a
                      href={team[selected].instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Instagram className="w-4 h-4" />
                      Instagram
                    </a>
                  </Button>
                  <Button variant="ghost" size="icon" className="h-9 w-9" asChild>
                    <a href={`mailto:${team[selected].email}`}>
                      <Mail className="w-4 h-4" />
                    </a>
                  </Button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </section>
  );
};

export default MeetTheTeam;
