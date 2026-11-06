import {useState,type FormEvent} from 'react';
import {Alert,Brand,Button,Icon,Input} from './components';
import {Checkbox} from './Checkbox';
import {ThemeSwitcher} from './ThemeSwitcher';
import './auth-pattern.css';

const benefits=[
  ['shield-check','Acceso protegido','Estados claros y controles accesibles.'],
  ['users','Trabajo conectado','Continúa donde tu equipo lo dejó.'],
  ['chart','Experiencia consistente','El mismo lenguaje en cada producto.'],
] as const;

export function AuthPattern(){
  const [email,setEmail]=useState('');
  const [password,setPassword]=useState('');
  const [showPassword,setShowPassword]=useState(false);
  const [errors,setErrors]=useState({email:'',password:''});
  const [done,setDone]=useState(false);
  const [message,setMessage]=useState('');

  function submit(event:FormEvent<HTMLFormElement>){
    event.preventDefault();
    const next={
      email:/^\S+@\S+\.\S+$/.test(email)?'':'Ingresa un correo electrónico válido.',
      password:password.length>=8?'':'Usa al menos 8 caracteres.',
    };
    setErrors(next);
    setDone(false);
    setMessage('');
    if(next.email||next.password)return;
    setDone(true);
  }

  return <section className="mk-auth-pattern" aria-labelledby="auth-title">
    <header className="mk-auth-header"><a href="#auth-title" aria-label="Ir al formulario de acceso"><Brand/></a><ThemeSwitcher small/></header>
    <div className="mk-auth-layout">
      <aside className="mk-auth-story" aria-label="Beneficios de MOK">
        <div><p className="mk-auth-eyebrow">TU ESPACIO DE TRABAJO</p><h2>Todo tu equipo,<br/>en el mismo lugar.</h2><p>Accede a proyectos, decisiones y métricas con una experiencia diseñada para mantener el foco.</p></div>
        <div className="mk-auth-benefits">{benefits.map(([icon,title,description])=><div key={title}><span><Icon name={icon}/></span><div><strong>{title}</strong><small>{description}</small></div></div>)}</div>
        <footer><Icon name="lock" size={16}/><span>Conexión cifrada · Sesión protegida</span></footer>
      </aside>
      <main className="mk-auth-main">
        <div className="mk-auth-card">
          <div className="mk-auth-heading"><p className="mk-auth-eyebrow">ACCESO SEGURO</p><h1 id="auth-title">Qué bueno verte.</h1><p>Entra a tu espacio de trabajo para continuar.</p></div>
          <Button className="mk-auth-sso" variant="outline" prefix="shield-check" onClick={()=>setMessage('Conecta aquí el proveedor SSO de tu organización.')}>Continuar con SSO</Button>
          <div className="mk-auth-divider"><span>o continúa con correo</span></div>
          <form className="mk-auth-form" onSubmit={submit} noValidate>
            <Input label="Correo electrónico" name="email" type="email" autoComplete="username" placeholder="tu@empresa.com" value={email} onValueChange={value=>{setEmail(value);if(errors.email)setErrors(current=>({...current,email:''}));}} error={errors.email} required autoFocus/>
            <Input label="Contraseña" name="password" type={showPassword?'text':'password'} autoComplete="current-password" value={password} onValueChange={value=>{setPassword(value);if(errors.password)setErrors(current=>({...current,password:''}));}} error={errors.password} hint="Al menos 8 caracteres" required suffixStyling={false} suffix={<button type="button" className="mk-auth-password-toggle" aria-label={showPassword?'Ocultar contenido':'Mostrar contenido'} title={showPassword?'Ocultar contraseña':'Mostrar contraseña'} aria-pressed={showPassword} onClick={()=>setShowPassword(value=>!value)}><Icon name={showPassword?'eye-off':'eye'} size={17}/></button>}/>
            <div className="mk-auth-options"><Checkbox label="Recordarme"/><button type="button" onClick={()=>setMessage('El flujo de recuperación debe conectarse con tu proveedor de identidad.')}>¿Olvidaste tu contraseña?</button></div>
            <Button className="mk-auth-submit" type="submit" suffix="arrow">Entrar</Button>
          </form>
          {message&&<Alert tone="info" title={message}>Esta acción pertenece a la demostración local.</Alert>}
          {done&&<Alert tone="success" title="Demostración completada">Se validaron los campos. Este ejemplo no inicia una sesión ni envía datos.</Alert>}
          <p className="mk-auth-signup">¿Aún no tienes acceso? <button type="button" onClick={()=>setMessage('Conecta aquí el flujo de solicitud de acceso.')}>Solicitar una cuenta</button></p>
        </div>
        <p className="mk-auth-legal">Al continuar aceptas los términos de uso y la política de privacidad de tu organización.</p>
      </main>
    </div>
  </section>;
}
