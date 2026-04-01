import { useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
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

const EQUIPAMENTOS = [
  "Nobreak Intelbras",
  "DESKTOP HP VERTICAL",
  "DESKTOP TORRE",
  "MINI PC DELL",
  "MINI PC CONNEC",
  "PC MINI ETECNET",
  "IMPRESSORA HP",
  "IMPRESSORA LEXMARK",
  "NOBREAK SMS",
  "NOTEBOOK PROOBOK 440",
  "NOTEBOOK ACER",
  "NOBREAK COLETEK",
  "NOTEBOOK DATEN",
  "DESKTOP HP",
  "MONITOR",
  "NOTEBOOK SANSUMG",
  "DESKTOP DELL",
  "TV DIGITAL",
  "NOTEBOOK DELL",
  "MINI PC THINK",
  "PROBOOK HP 445 G9",
  "PROBOOK HP 445 G8",
  "NOBREAK RAGTECH",
  "NOBREAK ENERMAX",
  "MONITOR HP",
  "CPU ITAUTEC",
  "TOCA CD PANASONIC",
  "AMPLIFICADOR DIGITAL",
  "ESTABILIZADOR DE TENSÃO",
  "CPU TITAN",
  "MONITOR DELL",
  "IMPRESSORA",
  "DATA SHOW",
  "NOBREAK",
  "DESKTOP DATEN",
  "MINITOR CHP",
  "CPU APPLE MAC PRO",
  "NOBREAK SAVE",
  "IMPRESSORA SAMSUNG",
  "DARUNA PC 400",
  "NOTEBOOK HP",
  "MONITOR ITAUTEC",
  "MONITOR SAMSUNG",
  "NOBREAK TS SHARA",
  "NOTEBOOK ASUS",
  "IMPRESSORA HP P2035",
  "TV SAMSUNG",
  "MICROFONE VOKAL",
  "CAMERA FOTOGRAFICA",
  "NOTEBOOK ITAUTEC",
  "MONITOR AOC",
  "MONITOR LG",
  "NOTEBOOK STI",
  "SCANNER HP",
  "TV SONY",
  "PROJETOR EPSON",
  "DVR INTELBRAS",
  "DESKTOP CCE",
  "TECLADO",
  "CAIXA DE SOM",
  "YUP-E",
  "CILINDRO DE IMPRESSORA",
  "COMPUTADOR AIO ACER",
  "DESKTOP ALL IN ONE ACER",
  "MONITOR ACER",
  "MONITOR CONNEC",
  "IMPRESSORA EPSON",
  "SWITCH INTELBRAS",
  "CPU MULTILASER",
  "NOTEBOOK POSITIVO",
  "SWITCH BASELINE",
  "TABLET SAMSUNG",
  "MINI PC LENOVO",
  "NOBREAK APC",
  "GABINETE",
  "DESKTOP DELL VOSTRO",
  "NOBREAK MAX POWER",
  "MINI PC ETECNET",
  "MODEM SMARTAX MT800",
  "MONITOR PHILIPS",
  "NOTEBOOK LENOVO",
  "TV_HQ 60'",
  "IMPRESSORA CANON",
  "PC DELL VOSTRO",
  "TABLETE RCA",
  "EPSON L14150",
  "DESKTOP ITAUTEC",
  "MECBOOK AIR",
  "Tablet YUNDAI",
  "Celular-Note",
  "Transformer",
  "Celular LG",
  "XIAOMI",
  "Celular_M",
  "DESKTOP_POSITIVO",
  "NOBREAK_Intel",
  "Tel_fixo_Intelb",
  "MONITOR DATEN",
  "SCAN AVISION",
  "Mini PC Daten",
  "DESKTOP LENOVO",
  "DESKTOP THINK",
  "NOBREAK JBR",
  "NOTEBOOK SONY",
  "HP OFFICEJET PTO 7740",
  "Tel_Fixo_Leucotron",
  "Tel_Fixo_Premium",
  "Tel_Fixo_Siemens",
  "Fax_Panasonic",
  "Micro-Ondas",
  "FAX INTELBRAS",
  "TEL_ELGIN",
  "DESKTOP ALL IN ONE DL",
  "MONITOR ASUS",
  "Bebedouro",
  "Monitor Positivo",
  "NOTEBOK PHILCO",
  "MONITOR INFOWAY",
  "DESKTOP ALLIN ONE HP",
];

interface EquipComboboxProps {
  value?: string;
  onChange: (value: string) => void;
}

export function EquipCombobox({ value, onChange }: EquipComboboxProps) {
  const [open, setOpen] = useState(false);

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
            {value || "Selecione o equipamento..."}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start" style={{ width: "var(--radix-popover-trigger-width)" }}>
        <Command>
          <CommandInput placeholder="Buscar equipamento..." className="h-9" />
          <CommandList>
            <CommandEmpty>Nenhum equipamento encontrado.</CommandEmpty>
            <CommandGroup>
              {EQUIPAMENTOS.map((equip) => (
                <CommandItem
                  key={equip}
                  value={equip}
                  onSelect={(val) => {
                    onChange(val === value ? "" : val);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === equip ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {equip}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
