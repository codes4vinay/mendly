import Layout from "@/components/shared/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { ShieldCheck, Wrench, Users } from "lucide-react";

const values = [
  {
    icon: Wrench,
    title: "Reliable Repairs",
    description:
      "We make it easier to find trusted repair centres for phones, laptops, appliances, and everyday devices.",
  },
  {
    icon: Users,
    title: "People First",
    description:
      "Customers and service owners both get a clear, simple experience for bookings, updates, and communication.",
  },
  {
    icon: ShieldCheck,
    title: "Transparent Service",
    description:
      "From pricing to status tracking, RPAR is built to reduce guesswork and help repairs feel manageable.",
  },
];

const AboutUs = () => {
  return (
    <Layout>
      <section className="bg-gradient-to-br from-indigo-50 via-background to-emerald-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600">
              About RPAR
            </p>
            <h1 className="text-4xl sm:text-5xl font-bold mt-4">
              Repair support and trusted service, all in one place.
            </h1>
            <p className="text-muted-foreground text-lg mt-6">
              RPAR connects customers with service centres and gives both
              sides the tools to manage bookings, products, updates, and
              conversations without the usual back-and-forth confusion.
            </p>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
        <div className="grid gap-6 md:grid-cols-3">
          {values.map((item) => (
            <Card key={item.title} className="border-foreground/10">
              <CardContent className="p-6 space-y-4">
                <div className="h-12 w-12 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
                  <item.icon className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold">{item.title}</h2>
                  <p className="text-sm text-muted-foreground mt-2">
                    {item.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-8 lg:grid-cols-2 items-start">
          <div>
            <h2 className="text-2xl font-semibold">What we are building</h2>
            <p className="text-muted-foreground mt-4 leading-7">
              We want repairs to feel less stressful. Instead of scattered
              calls, unclear timelines, and limited visibility, RPAR brings
              together discovery, booking, order management, chat, and service
              updates in one experience.
            </p>
          </div>
          <div className="rounded-3xl border border-foreground/10 bg-card p-8">
            <h3 className="font-semibold text-lg">Why it matters</h3>
            <p className="text-sm text-muted-foreground mt-3 leading-7">
              When device issues interrupt daily life, people need clarity fast.
              RPAR helps customers take action quickly and helps service
              centres run a more organized digital workflow.
            </p>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default AboutUs;
