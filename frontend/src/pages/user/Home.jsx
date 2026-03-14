import Layout from "@/components/shared/Layout";

const Home = () => {
  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h1 className="text-4xl font-bold">Welcome to Mendly</h1>
        <p className="text-muted-foreground mt-4">
          Electronics repair and marketplace platform
        </p>
      </div>
    </Layout>
  );
};

export default Home;
