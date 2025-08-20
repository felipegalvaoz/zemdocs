"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useState } from "react"

export function ConfiguracoesForm() {
  const [config, setConfig] = useState({
    apiUrl: "https://api-nfse-imperatriz-ma.prefeituramoderna.com.br",
    autoSync: true,
    syncInterval: "60",
    notificacoes: true,
  })

  const handleSave = () => {
    // TODO: Implementar salvamento das configurações
    console.log("Salvando configurações:", config)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configurações Gerais</CardTitle>
        <CardDescription>
          Configure as opções do sistema NFS-e
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="api-url">URL da API Externa</Label>
          <Input
            id="api-url"
            value={config.apiUrl}
            onChange={(e) => setConfig(prev => ({ ...prev, apiUrl: e.target.value }))}
            placeholder="https://api-nfse..."
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="auto-sync">Sincronização Automática</Label>
            <p className="text-sm text-muted-foreground">
              Sincronizar dados automaticamente com a API externa
            </p>
          </div>
          <Switch
            id="auto-sync"
            checked={config.autoSync}
            onCheckedChange={(checked) => setConfig(prev => ({ ...prev, autoSync: checked }))}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="sync-interval">Intervalo de Sincronização (minutos)</Label>
          <Input
            id="sync-interval"
            type="number"
            value={config.syncInterval}
            onChange={(e) => setConfig(prev => ({ ...prev, syncInterval: e.target.value }))}
            placeholder="60"
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="notifications">Notificações</Label>
            <p className="text-sm text-muted-foreground">
              Receber notificações sobre novas NFS-e
            </p>
          </div>
          <Switch
            id="notifications"
            checked={config.notificacoes}
            onCheckedChange={(checked) => setConfig(prev => ({ ...prev, notificacoes: checked }))}
          />
        </div>

        <Button onClick={handleSave} className="w-full">
          Salvar Configurações
        </Button>
      </CardContent>
    </Card>
  )
}
