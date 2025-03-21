
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  BarChart3, 
  ArrowRight, 
  Clock, 
  LineChart, 
  CheckCircle2,
  ChevronDown
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/layout/Navbar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { toast } from "sonner";

// Data types for our dashboard items
interface SurveyItem {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  responses: number;
  status: string;
}

interface SurveyResponseItem {
  id: string;
  surveyId: string;
  surveyTitle: string;
  respondentName: string;
  submittedAt: string;
}

interface SuggestionItem {
  id: string;
  content: string;
  customerName: string;
  createdAt: string;
  status: string;
}

interface RequirementItem {
  id: string;
  title: string;
  description: string;
  priority: string;
  createdAt: string;
  status: string;
}

// Mock data fetching functions - these would connect to your API
const fetchLatestSurvey = async (): Promise<SurveyItem> => {
  // Simulando una llamada API con un tiempo de respuesta realista
  await new Promise(resolve => setTimeout(resolve, 300));
  
  return {
    id: "1",
    title: "Encuesta de Satisfacción del Cliente",
    description: "Recopilar opiniones sobre la calidad de nuestro servicio al cliente",
    createdAt: "2023-12-15T12:00:00Z",
    responses: 8,
    status: "in-progress"
  };
};

const fetchRecentResponses = async (): Promise<SurveyResponseItem[]> => {
  // Simulando una llamada API con un tiempo de respuesta realista
  await new Promise(resolve => setTimeout(resolve, 400));
  
  return [
    {
      id: "1",
      surveyId: "1",
      surveyTitle: "Encuesta de Satisfacción del Cliente",
      respondentName: "María López",
      submittedAt: "2023-12-18T14:30:00Z"
    },
    {
      id: "2",
      surveyId: "1",
      surveyTitle: "Encuesta de Satisfacción del Cliente",
      respondentName: "Juan Pérez",
      submittedAt: "2023-12-17T09:15:00Z"
    },
    {
      id: "3",
      surveyId: "1",
      surveyTitle: "Encuesta de Satisfacción del Cliente",
      respondentName: "Ana Martínez",
      submittedAt: "2023-12-16T16:45:00Z"
    }
  ];
};

const fetchLatestSuggestion = async (): Promise<SuggestionItem> => {
  // Simulando una llamada API con un tiempo de respuesta realista
  await new Promise(resolve => setTimeout(resolve, 350));
  
  return {
    id: "1",
    content: "Agregar modo oscuro al portal del cliente",
    customerName: "Juan Pérez",
    createdAt: "2023-12-10T09:30:00Z",
    status: "pending"
  };
};

const fetchRecentSuggestions = async (): Promise<SuggestionItem[]> => {
  // Simulando una llamada API con un tiempo de respuesta realista
  await new Promise(resolve => setTimeout(resolve, 450));
  
  return [
    {
      id: "1",
      content: "Agregar modo oscuro al portal del cliente",
      customerName: "Juan Pérez",
      createdAt: "2023-12-10T09:30:00Z",
      status: "pending"
    },
    {
      id: "2",
      content: "Mejorar la velocidad de carga de las páginas",
      customerName: "María López",
      createdAt: "2023-12-09T15:20:00Z",
      status: "in-progress"
    },
    {
      id: "3",
      content: "Añadir más opciones de pago en la checkout",
      customerName: "Carlos Gómez",
      createdAt: "2023-12-08T11:45:00Z",
      status: "closed"
    }
  ];
};

const fetchLatestRequirement = async (): Promise<RequirementItem> => {
  // Simulando una llamada API con un tiempo de respuesta realista
  await new Promise(resolve => setTimeout(resolve, 320));
  
  return {
    id: "1",
    title: "Diseño responsivo para móviles",
    description: "La aplicación debe ser completamente responsiva en todos los dispositivos móviles",
    priority: "high",
    createdAt: "2023-12-05T14:20:00Z",
    status: "closed"
  };
};

const fetchRecentRequirements = async (): Promise<RequirementItem[]> => {
  // Simulando una llamada API con un tiempo de respuesta realista
  await new Promise(resolve => setTimeout(resolve, 380));
  
  return [
    {
      id: "1",
      title: "Diseño responsivo para móviles",
      description: "La aplicación debe ser completamente responsiva en todos los dispositivos móviles",
      priority: "high",
      createdAt: "2023-12-05T14:20:00Z",
      status: "closed"
    },
    {
      id: "2",
      title: "Implementar autenticación con Google",
      description: "Permitir a los usuarios iniciar sesión con sus cuentas de Google",
      priority: "medium",
      createdAt: "2023-12-04T10:15:00Z",
      status: "in-progress"
    },
    {
      id: "3",
      title: "Optimizar rendimiento en navegadores antiguos",
      description: "Mejorar la compatibilidad con IE11 y otros navegadores obsoletos",
      priority: "low",
      createdAt: "2023-12-03T09:30:00Z",
      status: "pending"
    }
  ];
};

// Función para actualizar el estado de un elemento
const updateItemStatus = async (itemType: string, id: string, status: string): Promise<boolean> => {
  console.log(`Actualizando estado de ${itemType} ${id} a ${status}`);
  // Simulando una llamada API con un tiempo de respuesta realista
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // En un caso real, aquí se haría la llamada a la API
  // Simulamos un éxito del 90% para ser realistas
  const success = Math.random() < 0.9;
  
  if (!success) {
    throw new Error(`Error al actualizar el estado del ${itemType}`);
  }
  
  return true;
};

// Component for status badges
const StatusBadge = ({ status }: { status: string }) => {
  switch (status) {
    case "pending":
      return (
        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
          <Clock className="h-3 w-3 mr-1" /> Pendiente
        </Badge>
      );
    case "in-progress":
      return (
        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
          <LineChart className="h-3 w-3 mr-1" /> En curso
        </Badge>
      );
    case "closed":
      return (
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
          <CheckCircle2 className="h-3 w-3 mr-1" /> Cerrada
        </Badge>
      );
    default:
      return null;
  }
};

// Función para traducir prioridades
const translatePriority = (priority: string): string => {
  switch (priority.toLowerCase()) {
    case "high":
      return "Alta";
    case "medium":
      return "Media";
    case "low":
      return "Baja";
    default:
      return priority;
  }
};

// Collapsible section component
const CollapsibleSection = ({ 
  title, 
  children, 
  expanded, 
  onToggle 
}: { 
  title: React.ReactNode, 
  children: React.ReactNode, 
  expanded: boolean, 
  onToggle: () => void 
}) => {
  return (
    <div className="border-b last:border-b-0">
      <div 
        className="w-full px-6 py-4 flex justify-between items-center hover:bg-gray-50 transition-colors cursor-pointer"
        onClick={onToggle}
      >
        <div>{title}</div>
        <ChevronDown className={cn(
          "h-5 w-5 text-gray-400 transition-transform",
          expanded && "transform rotate-180"
        )} />
      </div>
      <div className={cn(
        "bg-gray-50 px-6 py-3 grid transition-all",
        expanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
      )}>
        <div className="overflow-hidden">
          {children}
        </div>
      </div>
    </div>
  );
};

export default function Dashboard() {
  // State for tracking which sections are expanded
  const [expandedSections, setExpandedSections] = useState({
    surveys: false,
    suggestions: false,
    requirements: false
  });

  // Toggle a section's expanded state
  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Fetch data with React Query
  const { data: latestSurvey, isLoading: isLoadingSurvey } = useQuery({
    queryKey: ['latestSurvey'],
    queryFn: fetchLatestSurvey
  });

  const { data: recentResponses, isLoading: isLoadingResponses } = useQuery({
    queryKey: ['recentResponses'],
    queryFn: fetchRecentResponses,
    enabled: expandedSections.surveys // Only fetch when section is expanded
  });

  const { data: latestSuggestion, isLoading: isLoadingSuggestion } = useQuery({
    queryKey: ['latestSuggestion'],
    queryFn: fetchLatestSuggestion
  });

  const { data: recentSuggestions, isLoading: isLoadingSuggestions } = useQuery({
    queryKey: ['recentSuggestions'],
    queryFn: fetchRecentSuggestions,
    enabled: expandedSections.suggestions // Only fetch when section is expanded
  });

  const { data: latestRequirement, isLoading: isLoadingRequirement } = useQuery({
    queryKey: ['latestRequirement'],
    queryFn: fetchLatestRequirement
  });

  const { data: recentRequirements, isLoading: isLoadingRequirements } = useQuery({
    queryKey: ['recentRequirements'],
    queryFn: fetchRecentRequirements,
    enabled: expandedSections.requirements // Only fetch when section is expanded
  });

  // Format date strings
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('es-ES', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    }).format(date);
  };

  // Handler para actualizar el estado de un elemento
  const handleUpdateStatus = async (itemType: string, id: string, status: string) => {
    try {
      await updateItemStatus(itemType, id, status);
      
      // Refresh the corresponding query
      switch (itemType) {
        case 'survey':
          // Invalidate queries related to surveys
          break;
        case 'suggestion':
          // Invalidate queries related to suggestions
          break;
        case 'requirement':
          // Invalidate queries related to requirements
          break;
      }
      
      toast.success(`Estado del ${itemType} actualizado correctamente`);
    } catch (error) {
      toast.error(`Error al actualizar el estado: ${(error as Error).message}`);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto pt-20 pb-10 px-4 md:px-6">
        <h1 className="text-3xl font-bold tracking-tight mb-6">Panel de Control</h1>
        
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">Vista Rápida de Elementos Recientes</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {/* Survey Section */}
            <CollapsibleSection
              expanded={expandedSections.surveys}
              onToggle={() => toggleSection('surveys')}
              title={
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium">Encuestas</h3>
                    {isLoadingSurvey ? (
                      <div className="w-20 h-5 bg-gray-200 animate-pulse rounded-full"></div>
                    ) : latestSurvey ? (
                      <StatusBadge status={latestSurvey.status} />
                    ) : null}
                  </div>
                  {isLoadingSurvey ? (
                    <div className="space-y-2">
                      <div className="w-3/4 h-5 bg-gray-200 animate-pulse rounded"></div>
                      <div className="w-1/2 h-4 bg-gray-200 animate-pulse rounded"></div>
                    </div>
                  ) : latestSurvey ? (
                    <>
                      <p className="font-semibold">{latestSurvey.title}</p>
                      <p className="text-xs text-muted-foreground">
                        Creada {formatDate(latestSurvey.createdAt)} • {latestSurvey.responses} respuestas
                      </p>
                    </>
                  ) : (
                    <p className="text-gray-500">No hay encuestas disponibles</p>
                  )}
                </div>
              }
            >
              <div className="space-y-3">
                <h4 className="text-sm font-medium mb-2">Últimas 5 respuestas</h4>
                {isLoadingResponses ? (
                  <div className="space-y-2">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="bg-white p-3 rounded border">
                        <div className="flex justify-between">
                          <div className="w-1/3 h-4 bg-gray-200 animate-pulse rounded"></div>
                          <div className="w-1/4 h-4 bg-gray-200 animate-pulse rounded"></div>
                        </div>
                        <div className="w-2/3 h-4 mt-2 bg-gray-200 animate-pulse rounded"></div>
                      </div>
                    ))}
                  </div>
                ) : recentResponses && recentResponses.length > 0 ? (
                  <div className="space-y-2">
                    {recentResponses.map(response => (
                      <div key={response.id} className="bg-white p-3 rounded border text-sm">
                        <div className="flex justify-between">
                          <span className="font-medium">{response.respondentName}</span>
                          <span className="text-gray-500 text-xs">{formatDate(response.submittedAt)}</span>
                        </div>
                        <p className="text-gray-600">{response.surveyTitle}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No hay respuestas recientes</p>
                )}
                <div className="mt-3 text-right">
                  <Link to="/surveys" className="text-sm text-blue-600 hover:underline inline-flex items-center">
                    Ver todas las encuestas <ArrowRight className="ml-1 h-3 w-3" />
                  </Link>
                </div>
              </div>
            </CollapsibleSection>

            {/* Suggestions Section */}
            <CollapsibleSection
              expanded={expandedSections.suggestions}
              onToggle={() => toggleSection('suggestions')}
              title={
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium">Sugerencias</h3>
                    {isLoadingSuggestion ? (
                      <div className="w-20 h-5 bg-gray-200 animate-pulse rounded-full"></div>
                    ) : latestSuggestion ? (
                      <StatusBadge status={latestSuggestion.status} />
                    ) : null}
                  </div>
                  {isLoadingSuggestion ? (
                    <div className="space-y-2">
                      <div className="w-3/4 h-5 bg-gray-200 animate-pulse rounded"></div>
                      <div className="w-1/2 h-4 bg-gray-200 animate-pulse rounded"></div>
                    </div>
                  ) : latestSuggestion ? (
                    <>
                      <p className="font-semibold">{latestSuggestion.content}</p>
                      <p className="text-xs text-muted-foreground">
                        De {latestSuggestion.customerName} • {formatDate(latestSuggestion.createdAt)}
                      </p>
                    </>
                  ) : (
                    <p className="text-gray-500">No hay sugerencias disponibles</p>
                  )}
                </div>
              }
            >
              <div className="space-y-3">
                <h4 className="text-sm font-medium mb-2">Últimas 5 sugerencias</h4>
                {isLoadingSuggestions ? (
                  <div className="space-y-2">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="bg-white p-3 rounded border">
                        <div className="flex justify-between">
                          <div className="w-1/3 h-4 bg-gray-200 animate-pulse rounded"></div>
                          <div className="w-1/4 h-4 bg-gray-200 animate-pulse rounded"></div>
                        </div>
                        <div className="w-2/3 h-4 mt-2 bg-gray-200 animate-pulse rounded"></div>
                      </div>
                    ))}
                  </div>
                ) : recentSuggestions && recentSuggestions.length > 0 ? (
                  <div className="space-y-2">
                    {recentSuggestions.map(suggestion => (
                      <div key={suggestion.id} className="bg-white p-3 rounded border text-sm">
                        <div className="flex justify-between">
                          <span className="font-medium">{suggestion.customerName}</span>
                          <span className="text-gray-500 text-xs">{formatDate(suggestion.createdAt)}</span>
                        </div>
                        <p className="text-gray-600">
                          {suggestion.content.length > 60 
                            ? `${suggestion.content.substring(0, 60)}...` 
                            : suggestion.content}
                        </p>
                        <div className="flex justify-end mt-2">
                          <StatusBadge status={suggestion.status} />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No hay sugerencias recientes</p>
                )}
                <div className="mt-3 text-right">
                  <Link to="/suggestions" className="text-sm text-blue-600 hover:underline inline-flex items-center">
                    Ver todas las sugerencias <ArrowRight className="ml-1 h-3 w-3" />
                  </Link>
                </div>
              </div>
            </CollapsibleSection>

            {/* Requirements Section */}
            <CollapsibleSection
              expanded={expandedSections.requirements}
              onToggle={() => toggleSection('requirements')}
              title={
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium">Requerimientos</h3>
                    {isLoadingRequirement ? (
                      <div className="w-20 h-5 bg-gray-200 animate-pulse rounded-full"></div>
                    ) : latestRequirement ? (
                      <StatusBadge status={latestRequirement.status} />
                    ) : null}
                  </div>
                  {isLoadingRequirement ? (
                    <div className="space-y-2">
                      <div className="w-3/4 h-5 bg-gray-200 animate-pulse rounded"></div>
                      <div className="w-1/2 h-4 bg-gray-200 animate-pulse rounded"></div>
                    </div>
                  ) : latestRequirement ? (
                    <>
                      <p className="font-semibold">{latestRequirement.title}</p>
                      <p className="text-xs text-muted-foreground">
                        Prioridad: {translatePriority(latestRequirement.priority)} • {formatDate(latestRequirement.createdAt)}
                      </p>
                    </>
                  ) : (
                    <p className="text-gray-500">No hay requerimientos disponibles</p>
                  )}
                </div>
              }
            >
              <div className="space-y-3">
                <h4 className="text-sm font-medium mb-2">Últimos 5 requerimientos</h4>
                {isLoadingRequirements ? (
                  <div className="space-y-2">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="bg-white p-3 rounded border">
                        <div className="flex justify-between">
                          <div className="w-1/3 h-4 bg-gray-200 animate-pulse rounded"></div>
                          <div className="w-1/4 h-4 bg-gray-200 animate-pulse rounded"></div>
                        </div>
                        <div className="w-2/3 h-4 mt-2 bg-gray-200 animate-pulse rounded"></div>
                      </div>
                    ))}
                  </div>
                ) : recentRequirements && recentRequirements.length > 0 ? (
                  <div className="space-y-2">
                    {recentRequirements.map(requirement => (
                      <div key={requirement.id} className="bg-white p-3 rounded border text-sm">
                        <div className="flex justify-between">
                          <span className="font-medium">{requirement.title}</span>
                          <Badge className={cn(
                            "text-xs",
                            requirement.priority === 'high' 
                              ? "bg-red-50 text-red-700 border-red-200" 
                              : requirement.priority === 'medium' 
                                ? "bg-amber-50 text-amber-700 border-amber-200"
                                : "bg-green-50 text-green-700 border-green-200"
                          )}>
                            {translatePriority(requirement.priority)}
                          </Badge>
                        </div>
                        <p className="text-gray-600">
                          {requirement.description && requirement.description.length > 60 
                            ? `${requirement.description.substring(0, 60)}...` 
                            : requirement.description}
                        </p>
                        <div className="flex justify-end mt-2">
                          <StatusBadge status={requirement.status} />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No hay requerimientos recientes</p>
                )}
                <div className="mt-3 text-right">
                  <Link to="/requirements" className="text-sm text-blue-600 hover:underline inline-flex items-center">
                    Ver todos los requerimientos <ArrowRight className="ml-1 h-3 w-3" />
                  </Link>
                </div>
              </div>
            </CollapsibleSection>
          </CardContent>

          <div className="px-6 py-4 bg-gray-50 border-t">
            <div className="flex justify-end space-x-2">
              <Link to="/results">
                <Button size="sm">
                  <BarChart3 className="mr-2 h-4 w-4" />
                  Ver Análisis
                </Button>
              </Link>
              <Link to="/surveys">
                <Button variant="outline" size="sm">
                  Ver Todas las Encuestas
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
