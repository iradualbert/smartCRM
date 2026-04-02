import { Button } from "@/components/ui/button";

const BookingPage = () => {
  return (
    <div className="flex flex-col gap-6 p-4">
      {/* Create Button */}
      <Button variant="outline" size="sm" className="w-fit">
        Create a Booking Link
      </Button>

      {/* Booking Item */}
      <div className="flex flex-wrap items-center gap-4 rounded-md border p-4">
        <span className="font-medium">Booking Link One</span>

        <div className="flex gap-2">
          <Button size="sm" variant="secondary">
            Share Via Email
          </Button>

          <Button size="sm" variant="outline">
            Edit
          </Button>

          <Button size="sm" variant="ghost">
            Copy
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BookingPage;