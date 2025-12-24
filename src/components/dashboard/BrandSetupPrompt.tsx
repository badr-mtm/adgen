import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Sparkles } from "lucide-react";

export function BrandSetupPrompt() {
  const navigate = useNavigate();

  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <CardTitle className="text-base text-foreground">Set up your brand (optional)</CardTitle>
            <p className="text-sm text-muted-foreground">
              Add your logo, colors, and voice to make generated ads match your brand.
            </p>
          </div>
          <Badge variant="outline" className="text-xs text-muted-foreground">
            Recommended
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Sparkles className="h-4 w-4 text-primary" />
          <span>Takes ~2 minutes and can be done anytime.</span>
        </div>
        <Button onClick={() => navigate("/brand-setup")} className="sm:w-auto">
          Create your brand
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );
}
