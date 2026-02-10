import amqp from 'amqplib';

let connection: any = null;
let channel: any = null;

export const connectRabbitMQ = async () => {
    try {
        const amqpServer = process.env.RABBITMQ_URL || 'amqp://localhost';
        connection = await amqp.connect(amqpServer);
        channel = await connection.createChannel();

        if (channel) {
            await channel.assertQueue('ecg_analysis_queue', { durable: true });
        }

        console.log('✅ Connected to RabbitMQ');
        return channel;
    } catch (error) {
        console.error('❌ RabbitMQ Connection Error:', error);
        return null;
    }
};

export const getChannel = () => channel;
