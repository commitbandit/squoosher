import { ReactNode } from "react";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Form } from "@heroui/form";
import { motion } from "framer-motion";

interface FormCardProps {
  title: string;
  description: string;
  children: ReactNode;
  onSubmit: (e: React.FormEvent) => void;
}

export default function FormCard({
  title,
  description,
  children,
  onSubmit,
}: FormCardProps) {
  return (
    <Card className="border-none shadow-2xl rounded-3xl overflow-hidden backdrop-blur-sm bg-white/95">
      <div className="h-3 bg-gradient-to-r from-secondary via-primary to-secondary animate-gradient-x" />
      <CardHeader className="flex gap-3 p-8 pb-4">
        <motion.div
          animate={{ opacity: 1, x: 0 }}
          className="flex flex-col"
          initial={{ opacity: 0, x: -20 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <h3 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-secondary to-primary">
            {title}
          </h3>
          <p className="text-gray-500">{description}</p>
        </motion.div>
      </CardHeader>
      <Form onSubmit={onSubmit}>
        <CardBody className="p-0 space-y-2 grid grid-cols-1">
          {children}
        </CardBody>
      </Form>
    </Card>
  );
}
