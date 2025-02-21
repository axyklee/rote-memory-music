"use client"

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { api } from "@/trpc/react";
import { createProjectSchema } from "@/server/api/schemas/admin";

export default function CreateProjectDialog() {
    const [isOpen, setOpen] = useState(false);
    const [disabled, setDisabled] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const createProject = api.admin.createProject.useMutation();
    const form = useForm<z.infer<typeof createProjectSchema>>({
        resolver: zodResolver(createProjectSchema),
        defaultValues: {
            name: "",
        },
        disabled
    });
    const handleSubmit = form.handleSubmit(async (data) => {
        // set is submitting to true
        setDisabled(true);
        const result = await createProject.mutateAsync(data);
        if (!result) {
            setError("Failed to create project");
        } else {
            setError(null);
        }
        form.reset();
        setOpen(false);
        setTimeout(() => {
            // wait for animation to finish
            setDisabled(false);
        }, 1000);
    });


    return (
        <Dialog open={isOpen} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button>+ New Project</Button></DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Create new project</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={handleSubmit}>
                        <div className="grid gap-4 py-4">
                            <FormField control={form.control} name="name" render={({ field }) => (
                                <FormItem>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <FormLabel htmlFor="name" className="text-right">
                                            Name
                                        </FormLabel>
                                        <FormControl>
                                            <Input className="col-span-3" {...field} />
                                        </FormControl>
                                    </div>
                                    <FormMessage />
                                </FormItem>
                            )} />
                        </div>
                        {error && <p className="text-red-500">{error}</p>}
                        <DialogFooter>
                            {/* disable submit when loading */}
                            <Button type="submit" disabled={disabled}>
                                Create
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>);
}