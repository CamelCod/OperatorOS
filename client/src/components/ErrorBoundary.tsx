import React, { Component, ErrorInfo, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 p-4">
          <Card className="w-full max-w-md border-red-200 shadow-lg">
            <CardHeader className="bg-red-50/50 border-b border-red-100 pb-4">
              <div className="flex items-center gap-2 text-red-600">
                <AlertCircle className="h-6 w-6" />
                <CardTitle className="text-xl">System Malfunction</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <p className="text-gray-600">
                The application encountered an unexpected error. This has been logged for review.
              </p>
              
              {this.state.error && (
                <div className="bg-gray-100 p-3 rounded-md text-xs font-mono text-gray-700 overflow-auto max-h-32 border border-gray-200">
                  {this.state.error.message}
                </div>
              )}

              <Button 
                onClick={this.handleReset} 
                className="w-full bg-gray-900 hover:bg-gray-800 text-white gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Reboot System
              </Button>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
