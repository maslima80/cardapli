import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Loader2, FileDown, Check } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { toast } from "sonner";

interface GeneratePdfModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  catalogTitle: string;
  businessName?: string;
}

export function GeneratePdfModal({
  open,
  onOpenChange,
  catalogTitle,
  businessName,
}: GeneratePdfModalProps) {
  const [includeFooter, setIncludeFooter] = useState(true);
  const [includeContact, setIncludeContact] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [success, setSuccess] = useState(false);

  const generatePdf = async () => {
    setGenerating(true);
    setSuccess(false);
    
    try {
      // Get all the blocks that are visible in the preview
      const catalogBlocks = document.querySelectorAll(".catalog-preview-block");
      if (!catalogBlocks || catalogBlocks.length === 0) {
        throw new Error("No catalog content found");
      }

      // Create a new PDF with A4 dimensions
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      // PDF dimensions
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const margin = 10; // margin in mm

      // Add title page
      pdf.setFontSize(24);
      pdf.setFont("helvetica", "bold");
      pdf.text(catalogTitle, pdfWidth / 2, 40, { align: "center" });
      
      if (businessName) {
        pdf.setFontSize(16);
        pdf.setFont("helvetica", "normal");
        pdf.text(businessName, pdfWidth / 2, 60, { align: "center" });
      }
      
      pdf.setFontSize(12);
      pdf.text(`Gerado em ${new Date().toLocaleDateString()}`, pdfWidth / 2, 80, { align: "center" });

      // Process each block
      let currentPage = 1;
      pdf.addPage();

      for (let i = 0; i < catalogBlocks.length; i++) {
        const block = catalogBlocks[i] as HTMLElement;
        
        // Skip hidden blocks
        if (window.getComputedStyle(block).display === "none") {
          continue;
        }
        
        // Convert block to canvas
        const canvas = await html2canvas(block, {
          scale: 2, // Higher scale for better quality
          useCORS: true, // Allow loading cross-origin images
          logging: false,
        });
        
        // Calculate scaled dimensions to fit in PDF
        const imgWidth = pdfWidth - (margin * 2);
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        
        // Check if this block will fit on current page, if not add a new page
        if (currentPage > 1 && pdf.internal.getCurrentPageInfo().pageNumber !== currentPage) {
          pdf.addPage();
        }
        
        // Get current Y position
        const pageInfo = pdf.internal.getCurrentPageInfo();
        let yPosition = margin;
        
        if (pageInfo.pageNumber === currentPage) {
          yPosition = pdf.internal.getCurrentPageInfo().pageNumber === currentPage ? 
            pdf.internal.getCurrentPageInfo().margin.top : margin;
        }
        
        // Add image to PDF
        const imgData = canvas.toDataURL('image/png');
        pdf.addImage(imgData, 'PNG', margin, yPosition, imgWidth, imgHeight);
        
        // Update position for next block
        pdf.setY(yPosition + imgHeight + 5);
        
        // If next block won't fit, add a new page
        if (pdf.getY() + 20 > pdfHeight) {
          pdf.addPage();
          currentPage++;
        }
      }

      // Add footer if selected
      if (includeFooter) {
        const totalPages = pdf.internal.getNumberOfPages();
        for (let i = 1; i <= totalPages; i++) {
          pdf.setPage(i);
          pdf.setFontSize(10);
          pdf.setTextColor(150);
          pdf.text(
            `Página ${i} de ${totalPages}`,
            pdfWidth / 2,
            pdfHeight - 10,
            { align: "center" }
          );
          
          // Add powered by footer
          pdf.text(
            "Gerado por Cardapli",
            pdfWidth - margin,
            pdfHeight - 5,
            { align: "right" }
          );
        }
      }

      // Save the PDF
      pdf.save(`${catalogTitle.replace(/\s+/g, '-').toLowerCase()}.pdf`);
      setSuccess(true);
      toast.success("PDF gerado com sucesso!");
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Erro ao gerar PDF. Tente novamente.");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Gerar PDF do Catálogo</DialogTitle>
          <DialogDescription>
            Crie uma versão PDF do seu catálogo para compartilhar ou imprimir.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="include-footer" className="flex-1">
              Incluir numeração de páginas
            </Label>
            <Switch
              id="include-footer"
              checked={includeFooter}
              onCheckedChange={setIncludeFooter}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="include-contact" className="flex-1">
              Incluir informações de contato
            </Label>
            <Switch
              id="include-contact"
              checked={includeContact}
              onCheckedChange={setIncludeContact}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={generatePdf} disabled={generating}>
            {generating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Gerando...
              </>
            ) : success ? (
              <>
                <Check className="mr-2 h-4 w-4" />
                Concluído
              </>
            ) : (
              <>
                <FileDown className="mr-2 h-4 w-4" />
                Gerar PDF
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
