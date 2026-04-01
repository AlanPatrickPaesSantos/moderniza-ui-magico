import { useState, useEffect } from "react";
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface UnidadeComboboxProps {
  value?: string;
  onChange: (value: string) => void;
}

export function UnidadeCombobox({ value, onChange }: UnidadeComboboxProps) {
  const [open, setOpen] = useState(false);
  const [unidades, setUnidades] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchUnidades = async () => {
      setIsLoading(true);
      try {
        const res = await fetch("http://localhost:5001/api/unidades");
        const data = await res.json();
        setUnidades(data);
      } catch (err) {
        console.error("Erro ao carregar unidades:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUnidades();
  }, []);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between h-10 font-normal border-input bg-background hover:bg-muted/30"
        >
          <span className={cn("truncate", !value && "text-muted-foreground")}>
            {value || "Selecione a unidade..."}
          </span>
          {isLoading
            ? <Loader2 className="ml-2 h-4 w-4 shrink-0 animate-spin opacity-50" />
            : <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          }
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start" style={{ width: "var(--radix-popover-trigger-width)" }}>
        <Command>
          <CommandInput placeholder="Buscar unidade..." className="h-9" />
          <CommandList>
            <CommandEmpty>Nenhuma unidade encontrada.</CommandEmpty>
            <CommandGroup>
              {unidades.map((unidade) => (
                <CommandItem
                  key={unidade}
                  value={unidade}
                  onSelect={(val) => {
                    onChange(val === value ? "" : val);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === unidade ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {unidade}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
