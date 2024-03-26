'use client';

import axios from 'axios';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { FieldValues, SubmitHandler, useForm } from 'react-hook-form';

import Modal from './Modal';
import Heading from '../Heading';
import Input from '../Inputs/Input';
import useUserDetailModal from '@/app/hooks/useUserDetailModal';
import { SafeUser } from '@/app/types';
import getPasswordCheck from '@/app/actions/getPasswordCheck';
import toast from 'react-hot-toast';
import ImageUpload from '../Inputs/ImageUpload';
import { useRouter } from 'next/navigation';

enum STEPS{
    INFO = 0,
    PASSWORD = 1,
    PICTURE = 2
}

interface UserDetailModalProps{
    currentUser?: SafeUser | null;
}

const UserDetailModel:React.FC<UserDetailModalProps> = ({
    currentUser
}) => {
    const userDetailModel = useUserDetailModal();
    const router = useRouter();

    const [step, setStep] = useState(STEPS.INFO);
    const [isLoading, setIsLoading] = useState(false);
    const [isWrongPassword, setIsWrongPassword] = useState(false);
   
    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState:{
            errors,
        },
        reset
    } = useForm<FieldValues>({
        defaultValues: {
            name: currentUser?.name,
            email: currentUser?.email,
            currentPassword: '',
            newPassword:'',
            confirmPassword:'',
            imageSrc:''
        }
    })

    const imageSrc = watch('imageSrc');


    const setCustomValue = (id: string, value: any) => {
        setValue(id, value, {
            shouldValidate: true,
            shouldDirty:true,
            shouldTouch: true
        })
    }

    const checkPasswordMatch  = useCallback(() => {
    try {
        const isCorrectPassword = true;

        if (!isCorrectPassword) { // If the passwords don't match
            toast.error('Current password does not match.',{
                position: "bottom-right"
            });
            setIsWrongPassword(true);
        } else if (watch('newPassword') !== watch('confirmPassword')) { 
            toast.error('New password and confirm password do not match.',{
                position: "bottom-right"
            });
            setIsWrongPassword(true);
        } else {
            toast.success('Password Match',{
                position: "top-right"
            });
            setIsWrongPassword(false);
        }
    } catch (error) {
        console.error('Error comparing passwords:', error); // Log any errors during comparison
        toast.error('An error occurred while comparing passwords.',{
            position: "bottom-center"
        }); 
    }
}, [watch]);

    useEffect(() => {
        if(watch('newPassword') && watch('confirmPassword')){
            const timer = setTimeout(checkPasswordMatch, 500);
            return () => clearTimeout(timer);
        }
    }, [checkPasswordMatch, watch, watch('confirmPassword'), watch('newPassword')]);

    const onBack = () => {
        setStep((value) => value -1);
        reset({
            name: watch('name'),
            email: watch('email'),
            currentPassword: watch('currentPassword'),
            newPassword: watch('newPassword'),
            confirmPassword: watch('confirmPassword'),
            imageSrc: watch('imageSrc')
        });
    };

    const onNext = () => {
        setStep((value) => value + 1);
    };

    const onSubmit: SubmitHandler<FieldValues> = (data) => {
        if(step !== STEPS.PICTURE){
            if(step == STEPS.PASSWORD && isWrongPassword){
                return toast.error("Passwords didn't match")
            }
            return onNext();
        }

        setIsLoading(true);

        axios.patch('/api/userInfo', {...data, oEmail:currentUser?.email})
        .then(() => {
            toast.success("User Info Edited");
            router.refresh();
            reset();
            setStep(STEPS.INFO);
            userDetailModel.onClose();
        })
        .catch((error) => {
            console.log(error);
            toast.error('Something went wrong.',{
                position: "bottom-center"
              });
        }).finally(() => {
            setIsLoading(false);
        })

    }

    const actionLabel = useMemo(() => {
        if(step === STEPS.PICTURE){
            return 'Create';
        }
        return 'Next'
    }, [step]);

    const secondaryActionLabel = useMemo(() => {
        if( step === STEPS.INFO){
            return undefined;
        }
        return 'Back';
    },[step])


    const toggle = useCallback(() => {
        if (currentUser) {
            reset({
                name: currentUser.name,
                email: currentUser.email,
                currentPassword: '',
                newPassword: '',
                confirmPassword: '',
                imageSrc: ''
            });
        }
        userDetailModel.onClose();
        setStep(STEPS.INFO);
    }, [currentUser, userDetailModel, reset]);

    let bodyContent = (
        <div className='flex flex-col gap-4'>
            <Heading 
                title='Welcome from user Info'
                subtitle='Edit your Info!'
            />
            <Input 
                id="email"
                label='Email'
                disabled={isLoading}
                register={register}
                errors={errors}
                required
                type='email'
            />
            <Input 
                id="name"
                label='Name'
                disabled={isLoading}
                register={register}
                errors={errors}
                required
            />
        </div>
    );
    
    if(step === STEPS.PASSWORD){
        bodyContent = (
            <div className='flex flex-col gap-4'>
                <Heading 
                    title='Change Your Password'
                    subtitle='Update your account security by changing your password'
                />
                <Input 
                    id="currentPassword"
                    label='Current Password'
                    disabled={isLoading}
                    register={register}
                    errors={errors}
                    type='password'
                />
                <Input 
                    id="newPassword"
                    label='New Password'
                    disabled={isLoading}
                    register={register}
                    errors={errors}
                    required={watch('currentPassword') ? true : false}
                    type='password'
                />
                <Input 
                    id="confirmPassword"
                    label='Confirm Password'
                    disabled={isLoading}
                    register={register}
                    errors={errors}
                    required={watch('newPassword') ? true : false}
                    type='password'
                />
            </div>
        );
    }

    if(step === STEPS.PICTURE){
        bodyContent = (
            <div className="flex flex-col gap-8">
                <Heading 
                   title="Upload Your Profile Picture"
                   subtitle="Add a photo to personalize your profile"
                />
                <ImageUpload
                    value={imageSrc}
                    onChange={(value) => setCustomValue('imageSrc', value)}
                
                />
            </div>
        )
    }
   

    return (
        <Modal 
            disabled={isLoading} 
            isOpen={userDetailModel.isOpen} 
            title='User Info'
            actionLabel={actionLabel}
            secondaryAction={step === STEPS.INFO ? undefined : onBack}
            secondaryActionLabel={secondaryActionLabel}
            onClose={toggle} 
            onSubmit={handleSubmit(onSubmit)}
            body={bodyContent}
        />
    );
}
 
export default UserDetailModel;