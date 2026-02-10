import { motion } from "framer-motion";
import { Mail, Linkedin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import binitaPhoto from "@/assets/team-binita.jpeg";

const team = [
  {
    name: "Binita Pahadi",
    role: "Assistant Manager",
    description:
      "Specializing in student recruitment and visa processing for Italy and the EU. Fluent in Nepali, Hindi, and English.",
    photo: binitaPhoto,
    linkedin: "https://linkedin.com",
    email: "binita@recruitlygroup.com",
  },
  {
    name: "Suresh Limbu",
    role: "Manpower Recruitment Lead",
    description:
      "Expert in connecting skilled labor from South Asia and the UAE with employers globally. Focuses on ethical recruitment for Qatar and EU markets.",
    photo: null,
    linkedin: "https://linkedin.com",
    email: "suresh@recruitlygroup.com",
  },
  {
    name: "Maria Petrova",
    role: "Apostille & Documentation Specialist",
    description:
      "Manages document attestation, legalizations, and apostille services for students and workers moving between the UAE and Europe.",
    photo: null,
    linkedin: "https://linkedin.com",
    email: "maria@recruitlygroup.com",
  },
];

const MeetTheTeam = () => {
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
              <Card className="overflow-hidden h-full border-border/50 shadow-lg hover:shadow-xl transition-shadow">
                {/* Portrait photo */}
                <div className="aspect-[3/4] bg-muted overflow-hidden">
                  {member.photo ? (
                    <img
                      src={member.photo}
                      alt={member.name}
                      className="w-full h-full object-cover object-top"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground text-6xl font-bold select-none">
                      {member.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </div>
                  )}
                </div>

                <CardContent className="p-6 flex flex-col gap-3">
                  <div>
                    <h3 className="text-xl font-semibold text-foreground">
                      {member.name}
                    </h3>
                    <p className="text-sm font-medium text-accent">
                      {member.role}
                    </p>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {member.description}
                  </p>
                  <div className="flex gap-2 mt-auto pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1.5"
                      asChild
                    >
                      <a
                        href={member.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Linkedin className="w-4 h-4" />
                        LinkedIn
                      </a>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9"
                      asChild
                    >
                      <a href={`mailto:${member.email}`}>
                        <Mail className="w-4 h-4" />
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default MeetTheTeam;
