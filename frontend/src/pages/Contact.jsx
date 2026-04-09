import Layout from "@/components/shared/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Mail, MapPin, Phone } from "lucide-react";

const contactItems = [
  {
    icon: Mail,
    title: "Email",
    value: "support@rpar.in",
    href: "mailto:support@rpar.in",
  },
  {
    icon: Phone,
    title: "Phone",
    value: "+91 98765 43210",
    href: "tel:+919876543210",
  },
  {
    icon: MapPin,
    title: "Location",
    value: "Bengaluru, India",
  },
];

const Contact = () => {
  return (
    <Layout>
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600">
            Contact
          </p>
          <h1 className="text-4xl font-bold mt-4">Get in touch with RPAR</h1>
          <p className="text-muted-foreground text-lg mt-6">
            Questions, feedback, partnership ideas, or support requests: reach
            out and we will point you in the right direction.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3 mt-12">
          {contactItems.map((item) => (
            <Card key={item.title} className="border-foreground/10">
              <CardContent className="p-6 space-y-4">
                <div className="h-12 w-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <item.icon className="h-6 w-6" />
                </div>
                <div>
                  <p className="font-semibold">{item.title}</p>
                  {item.href ? (
                    <a
                      href={item.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {item.value}
                    </a>
                  ) : (
                    <p className="text-sm text-muted-foreground">{item.value}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-12 rounded-3xl border border-foreground/10 bg-card p-8">
          <h2 className="text-2xl font-semibold">Support hours</h2>
          <p className="text-muted-foreground mt-3">
            Monday to Saturday, 9:00 AM to 6:00 PM IST
          </p>
          <p className="text-sm text-muted-foreground mt-4 leading-7">
            For platform-related issues, account help, or service centre
            onboarding questions, email is the best first contact method.
          </p>
        </div>
      </section>
    </Layout>
  );
};

export default Contact;
