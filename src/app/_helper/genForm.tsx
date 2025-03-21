"use client"

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

export type zGenForm = {
    name: string;
    label: string;
    defaultValue?: string | number | boolean;
    type: "text" | "number" | "email" | "password" | "switch" | "custom";
    custom?: JSX.Element;
}[];

/**
 * 
 * @param schema Zod schema
 * @param defaultValues Default values conforming to the schema
 * @param handleSubmit Async function to handle form submission
 */
export default function GeneratedForm(props: {
        schema: z.ZodObject<any>,
        formGen: zGenForm,
        handleSubmit: (data: any) => any
    }) {
    const [disabled, setDisabled] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const { schema, formGen, handleSubmit } = props;

    const form = useForm<z.infer<typeof schema>>({
        resolver: zodResolver(schema),
        defaultValues: formGen.reduce((acc, item) => {
            acc[item.name] = item.defaultValue;
            return acc;
        }, {} as any),
        disabled
    });
    const formHandleSubmit = form.handleSubmit(async (data) => {
        // set is submitting to true
        setDisabled(true);
        const result = await handleSubmit(data);
        if (!result) {
            setError("Failed to create project");
        } else {
            setError(null);
        }
        form.reset();
        setTimeout(() => {
            // wait for animation to finish
            setDisabled(false);
        }, 1000);
    });

    return (
        <Form {...form}>
            <form onSubmit={formHandleSubmit}>
                {
                    formGen.map((item) =>
                        <FormField key={item.name} control={form.control} name={item.name} render={({ field }) => (
                            <FormItem>
                                <div className="my-3 max-w-96">
                                    <FormLabel htmlFor={item.name}>{item.label}</FormLabel>
                                    <FormControl>
                                        {
                                            item.type === "text" ? <Input className="w-full" {...field} /> :
                                                item.type === "number" ? <Input className="w-full" type="number" {...field} /> :
                                                    item.type === "email" ? <Input className="w-full" type="email" {...field} /> :
                                                        item.type === "password" ? <Input className="w-full" type="password" {...field} /> :
                                                            item.type === "switch" ? <Switch className="ml-2" checked={field.value} onCheckedChange={field.onChange} /> :
                                                                item.type === "custom" ? item.custom : null
                                        }
                                    </FormControl>
                                    <FormMessage />
                                </div>
                            </FormItem>
                        )} />
                    )
                }
                <Button type="submit" disabled={disabled}>
                    Save
                </Button>
                {error && <p className="mt-2 text-red-500">{error}</p>}
            </form>
        </Form>
    )
}