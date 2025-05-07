
import { QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";

const QRCodeDisplay = () => {
  const currentUrl = window.location.href;
  
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Ask a Question',
          text: 'Scan this QR code to ask a question',
          url: currentUrl,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      try {
        await navigator.clipboard.writeText(currentUrl);
        alert('URL copied to clipboard!');
      } catch (error) {
        console.error('Error copying to clipboard:', error);
      }
    }
  };
  
  return (
    <div className="p-6 bg-white/80 backdrop-blur-sm rounded-2xl shadow-md space-y-4">
      <h3 className="text-lg font-semibold text-center text-gray-800">
        Share This Page
      </h3>
      
      <div className="flex justify-center py-4">
        <div className="p-4 border-4 border-brand-light-purple rounded-lg bg-white">
          <QrCode className="h-32 w-32 text-brand-purple" strokeWidth={1.5} />
        </div>
      </div>
      
      <Button 
        onClick={handleShare}
        variant="outline" 
        className="w-full border-2 border-brand-light-purple hover:border-brand-purple hover:bg-brand-light-purple/30"
      >
        Share Link
      </Button>
    </div>
  );
};

export default QRCodeDisplay;
