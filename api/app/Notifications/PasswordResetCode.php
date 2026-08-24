<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

/**
 * Código de recuperação de senha.
 *
 * É um código curto, e não um link: o aluno abre o e-mail no mesmo celular
 * em que o app está aberto, e digitar 6 dígitos é mais simples do que fazer
 * um link voltar para dentro do app.
 */
class PasswordResetCode extends Notification
{
    use Queueable;

    public function __construct(private readonly string $code, private readonly int $minutes) {}

    /**
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Seu código para redefinir a senha — iFoodies')
            ->greeting('Olá!')
            ->line('Use o código abaixo para criar uma senha nova no app da cantina:')
            ->line('**'.$this->code.'**')
            ->line("O código vale por {$this->minutes} minutos.")
            ->line('Se não foi você que pediu, pode ignorar este e-mail — sua senha continua a mesma.');
    }
}
