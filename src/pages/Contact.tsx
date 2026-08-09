import LeadForm from "../components/LeadForm";
import Seo from "../components/Seo";

export default function Contact() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <Seo title="Contact" />
      <h1 className="text-3xl font-bold mb-2">Contact</h1>
      <p className="text-gray-600 mb-8">
        Send us a message — it lands directly in our CRM.
      </p>
      <LeadForm />
    </div>
  );
}
