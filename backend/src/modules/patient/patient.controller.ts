import { Controller, Post, Get, Patch, Body, Param } from '@nestjs/common';
import { PatientService } from './patient.service';
import { UpdatePatientProfileDto } from './dto/create-patient.dto';
import { BookAppointmentDto } from './dto/book-appointment.dto';
import { AskAiDto } from './dto/ask-ai.dto';

@Controller('patients')
export class PatientController {
  constructor(private readonly patientService: PatientService) {}

  @Post(':userId/profile')
  createProfile(@Param('userId') userId: string, @Body() dto: UpdatePatientProfileDto) {
    return this.patientService.createProfile(userId, dto);
  }

  @Get(':userId/profile')
  getProfile(@Param('userId') userId: string) {
    return this.patientService.getProfile(userId);
  }

  @Post(':id/appointments')
  bookAppointment(@Param('id') id: string, @Body() dto: BookAppointmentDto) {
    return this.patientService.bookAppointment(id, dto);
  }

  @Post(':id/appointments/:appointmentId/cancel')
  cancelAppointment(@Param('id') id: string, @Param('appointmentId') appointmentId: string) {
    return this.patientService.cancelAppointment(id, appointmentId);
  }

  @Post(':id/appointments/:appointmentId/reschedule')
  rescheduleAppointment(
    @Param('id') id: string,
    @Param('appointmentId') appointmentId: string,
    @Body('newScheduleId') newScheduleId: string,
  ) {
    return this.patientService.rescheduleAppointment(id, appointmentId, newScheduleId);
  }

  @Get(':id/appointments')
  getAppointments(@Param('id') id: string) {
    return this.patientService.getAppointments(id);
  }

  @Post(':id/ai-recommendations')
  askAi(@Param('id') id: string, @Body() dto: AskAiDto) {
    return this.patientService.askAi(id, dto);
  }

  @Get(':id/ai-recommendations')
  getRecommendations(@Param('id') id: string) {
    return this.patientService.getRecommendations(id);
  }

  @Get('notifications/:userId')
  getNotifications(@Param('userId') userId: string) {
    return this.patientService.getNotifications(userId);
  }

  @Patch('notifications/:userId/:notifId/read')
  readNotification(@Param('userId') userId: string, @Param('notifId') notifId: string) {
    return this.patientService.readNotification(userId, notifId);
  }

  @Get(':id/medical-records')
  getMedicalRecords(@Param('id') id: string) {
    return this.patientService.getMedicalRecords(id);
  }

  @Post(':id/appointments/:appointmentId/join')
  joinSession(@Param('id') id: string, @Param('appointmentId') appointmentId: string) {
    return this.patientService.joinSession(id, appointmentId);
  }
}
