import Layout from "@/components/shared/Layout";

const sections = [
  {
    title: "Information We Collect",
    body:
      "We may collect account details, booking information, contact numbers, order details, and messages needed to operate the platform and support repair workflows.",
  },
  {
    title: "How We Use Information",
    body:
      "Your data is used to manage accounts, process bookings and orders, enable communication between customers and service centres, and improve the service experience.",
  },
  {
    title: "Sharing of Information",
    body:
      "Relevant details are shared only with the parties involved in a transaction or service request, such as the selected service centre, and when required by law.",
  },
  {
    title: "Data Protection",
    body:
      "We take reasonable technical and operational steps to protect user information, though no internet-based system can be guaranteed to be fully secure.",
  },
  {
    title: "User Choices",
    body:
      "Users can update profile information and may contact support regarding account or privacy-related concerns.",
  },
];

const TrustPage = () => {
  return (
    <Layout>
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600">
          Privacy Policy
        </p>
        <h1 className="text-4xl font-bold mt-4">How Mendly handles data</h1>
        <p className="text-muted-foreground mt-6 leading-7">
          This page gives a simple overview of how platform information is used
          inside Mendly. It is a product-facing privacy page and should be
          reviewed further if you need a legally finalized policy for production
          launch.
        </p>

        <div className="mt-12 space-y-8">
          {sections.map((section) => (
            <div
              key={section.title}
              className="rounded-3xl border border-foreground/10 bg-card p-8"
            >
              <h2 className="text-xl font-semibold">{section.title}</h2>
              <p className="text-sm text-muted-foreground mt-3 leading-7">
                {section.body}
              </p>
            </div>
          ))}
        </div>
      </section>
    </Layout>
  );
};

export default TrustPage;
